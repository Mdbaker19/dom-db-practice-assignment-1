(() => {
    let foods;
    let users;
    let user;
    let htmlCounter = 0;
    let order = [];
    let cart = $("#cart");
    let body = $("body");
    cart.hide();

    // make the calls and get back the data from Fire base DB
    // parse and turn to an Array of objects to use later
    async function pullData() {
        const foodsData = await fetchData(options.food);
        const usersData = await fetchData(options.users);
        foods = formatData(foodsData);
        users = formatData(usersData);
    }

    function formatData(fireBaseObj) {
        let dataArr = [];
        for (const item in fireBaseObj) {
            dataArr.push(fireBaseObj[item]);
        }
        return dataArr;
    }

    pullData().then(() => {
        runSite();
    });

    function runSite() {
        console.log(foods);
        console.log(users);
        $("#load").fadeOut(800);
        $(".after").fadeIn(600);
        $("#foods").html(renderFoodsHtml(foods));
    }

    function renderFoodsHtml(foodArr){
        return foodArr.reduce((acc, curr) => {
            return acc + renderFood(curr);
        }, "");
    }

    function renderFood(foodObj) {
        return `<div class="food-card">
                    <button class="order-item right btn-floating waves-effect">Order</button>
                    <h3>${foodObj.name} <span>${foodObj.price > 0 ? foodObj.price : ""}</span></h3>
                    <div class="input-field row">
                        ${renderSelectForOptions(foodObj.additional)}
                    </div>
                </div>`;
    }


    function renderSelectForOptions(additionalProp) {
        let html = "";
        for(const item in additionalProp) {
            let value = additionalProp[item];
            if(Array.isArray(value)) {
                // create a select with options from this value, radio buttons
                html+=`<div class="col s4"><h6>${item}</h6>`;
                for(let i = 0; i < value.length; i++) {
                    html+=` <label>
                             <input class="with-gap" name="group${htmlCounter}" type="radio" />
                             <span>${value[i]}</span>
                           </label>`;
                }
                html+=`</div>`;
                htmlCounter++;
            } else {
                html+=`<p>${value}</p>`;
            }
        }
        return html;
    }


    $("#login").on("click", () => {
        let un = $("#userName")[0].value;
        if(un.trim().length === 0) {
            alert("User name can not be blank");
            return;
        }
        let userAttempt = validateUserName(un);
        if(userAttempt.length === 1){
            user = userAttempt[0];
            $("#login-modal-button").hide();
            $("#noUserFound").hide();
            $("#currentUser").text(user.name);
            $("#wallet").text(user.wallet);
            showOrderBtns();
            cart.fadeIn(400);
            // log the user in
            // show that users data on the nav, distance for delivery fee and wallet
        } else {
            $("#noUserFound").show();
            $("#noUNFound").text(un);
        }
    })
    function validateUserName(userName){
        // check the users obj for existence of the username
        return users.filter(user => user.name.toLowerCase() === userName.toLowerCase());
    }

    function showOrderBtns(){
        Array.from(document.getElementsByClassName("order-item")).forEach(ele => {
            ele.style.display = "inline-block";
        });
    }

    body.on("click", ".order-item", (e) => {
        if(!user) return; // really not necessary as the buttons are hidden until logged in but never know
        let common = e.currentTarget.parentElement.children[1];

        // time to implement a hacky solution for ice cream..
        let possibleItemArr = common.innerText.split(" ");
        let item = isItIceCream(possibleItemArr);
        // need to add logic to check if there are options associated with the order
        // function to check if the specific item name contains type selections?
        // diff path if does for the item
        if(containsOptions(item)) {
            order.push(item); // with the options tho...
            // how can I get the options that were checked...
            console.log("this item has options!");
        } else {
            order.push(item);
        }

        let price = common.children[0].innerText;
        user.wallet = parseFloat((user.wallet - price).toFixed(2)); // if you can buy, otherwise do something
        $("#wallet").text(user.wallet.toFixed(2));
    });

    // do not like this at all...
    function isItIceCream(possibleItem) {
        return possibleItem.length > 2 ? `${possibleItem[0]} ${possibleItem[1]}` : possibleItem[0];
    }

    function containsOptions(item) {
        let foodOptions = foods.filter(f => f.name === item)[0].additional;
        // if any of this food.additional contain an array of options return true
        for(const item in foodOptions) {
            let value = foodOptions[item];
            if (Array.isArray(value)) return true;
        }
        return false;
    }

    cart.on("click", () => {
        $("#cart-content").html(showCartContent(order));
    });

    function showCartContent(cartData) {
        cartData = reduceCartData(cartData);
        return `<div id="cart-items">
                    ${cartData}
                </div>`;
    }

    function reduceCartData(cartData) {
        let countedItems = cartData.map(item => {
            return cartData.filter(i => item === i).length + " " + item;
        });
        let set = new Set();
        for(let i = 0; i < countedItems.length; i++) {
            set.add(countedItems[i]);
        }
        let output = "";
        set.forEach(val => {
            output += `<div class="food-item-in-cart">
                            <h4>${val} : ${priceForValAndQuantity(val)}</h4>
                            <button class="change-quantity add-item">+</button>
                            <button class="change-quantity remove-item">-</button>
                        </div>`;
        });
        return output;
    }

    function priceForValAndQuantity(item) {
        // using the rest operator! for the remaining values after amount is extracted
        // to handle ice cream, 2 words returned as the rest
        let [amount, ...name] = item.split(" ");
        let price = foods.filter(food => food.name === name.join(" "))[0].price;
        return amount * price;
    }

    body.on("click", ".change-quantity", (e) => {
        let tgt = e.currentTarget;
        let op = tgt.innerText;
        let [quantity, item] = tgt.parentElement.children[0].innerText.split(" ");
        op === "+" ? quantity++ : quantity--;
        tgt.parentElement.children[0].innerText = handleItemChange(quantity, item);
        console.log(quantity, item);
        console.log(order);
    });

    function handleItemChange(newQuantity, item) {
        // if it goes below 1, remove it from the cart
        updateCartPrice();
        return newQuantity + " " + item;
    }

    function updateCartPrice(){
        // after an items quantity has changed, update the price
    }

    function calculateDeliverPrice(user) {
        // based off user.distance
        // can they still afford the order, disable the button if they can not
    }

})();