(() => {
    let foods;
    let users;
    let user;
    let htmlCounter = 0;
    let order = [];
    let cart = $("#cart")
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
        // render login button and the ability to
        // render options on screen
        // nav and cart
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
                    <h3>${foodObj.name} <span>${foodObj.price}</span></h3>
                    ${renderSelectForOptions(foodObj.additional)}
                </div>`;
    }


    // issue with clicking the check boxes...
    function renderSelectForOptions(additionalProp) {
        let html = "";
        for(const item in additionalProp) {
            let value = additionalProp[item];
            if(Array.isArray(value)) {
                // create a select with options from this value
                html+=`<div class="input-field row"><label>`;
                for(let i = 0; i < value.length; i++) {
                    html+=`<input type="checkbox" id="${value[i]}-${htmlCounter}"/>
                            <span class="check-option">${value[i]}</span>`
                }
                html+=`</label></div>`;
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

    $("body").on("click", ".order-item", (e) => {
        if(!user) return;
        let item = e.currentTarget.parentElement.children[1].innerText.split(" ")[0];
        order.push(item);
        let price = e.currentTarget.parentElement.children[1].children[0].innerText;
        user.wallet -= price; // if you can buy, otherwise do something
        $("#wallet").text(user.wallet.toFixed(2));
    });

    cart.on("click", () => {
        $("#cart-content").html(showCartContent(order));
    });

    function showCartContent(cartData) {
        cartData = reduceCartData(cartData);
        return `<div>
                    ${cartData}
                </div>`
    }

    function reduceCartData(cartData) {
        // update it to show salad x 5 rather than salad 5 times
        // needs more work, currently says 5 salad but 5 times...
        return cartData.map(item => {
            return cartData.filter(i => item === i).length + " " + item;
        })
    }

})();