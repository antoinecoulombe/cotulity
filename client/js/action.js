$(function() {
    showLoginForm();

    $('.submit-go').click((e) => connect(e));
    $('.login-p > i:last-of-type').click((e) => LoginToSignUp());
    $('.signup-p > i:last-of-type').click((e) => SignUpToLogin());

    $('#login > input').keypress(function (e) {
        if(e.which == 13) $('.submit-go').click();
    });
});

function hasErrors() {

}

function showError(message) {
    console.log(message); // TO DO
}

function getUser() {

}

function tryConnect(e) {
    if (hasErrors)
        return;
        
    if (getUser().data.length == 0) {
        showError("You have entered an invalid username or password.");
        return;
    }

    $('.submit-go').fadeOut(200, () => {
        $('.submit-go').hide();
        $('.submit-load').css("display", "inline-block");
    });

    setTimeout(() => connect(), 750);
}

function connect() {

}

function showLoginForm() {
    $("#logo").animate({ opacity: 1 }, 750);

    setTimeout(() => {
        $("#logo").animate({ marginBottom: 35 }, 400);
        $("#container").animate({ width: 482 }, 400);

        setTimeout(() => {
            $("#login").animate({ opacity: 1 }, 300);
        }, 500);
    }, 1250);
}

function LoginToSignUp() {
    $('#login > input[name=isLogin]').val(0);

    $('.login-p').hide();

    $('.signup-p').show();
    $('.signup-p').css({ opacity: 0 });
    $('.signup-input').animate({ opacity: 1}, 500, () => $(".signup-p").animate({ opacity: 1 }, 500));
    
    $('.signup-input').css("display", "inline-block");
    

    setTimeout(() => $('.submit-go, .submit-load').animate({ top: 117 }, 275), 150);
}

function SignUpToLogin() {
    $('#login > input[name=isLogin]').val("1");

    $('.signup-p').hide();

    $(".signup-input").animate({ opacity: 0 }, 500, () => { 
        $('.signup-input').hide();

        $('.login-p').show();
        $('.login-p').css({ opacity: 0 });
        $('.login-p').animate({ opacity: 1}, 500);
    });

    $('.submit-go, .submit-load').animate({ top: 9 }, 275);
}