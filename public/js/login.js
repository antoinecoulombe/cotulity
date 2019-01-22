$(function() {
    showLoginForm();

    $('.login-p > i:last-of-type').click((e) => loginToSignUp());
    $('.signup-p > i:last-of-type').click((e) => signUpToLogin());

    $('#login > input').keypress((e) => {
        if(e.which == 13) $('.submit-go').click();
    });

    $(".form-input > input").blur((e) => {
        let i = $(e.target);
        if ($(e.target).val().length == 0) {
            $(e.target).removeClass("filled");
            $(e.target).next().removeClass("filled");
        }
        else {
            $(e.target).addClass("filled");
            $(e.target).next().addClass("filled");
        }
    });

    $(".submit-go").click((e) => {
        if ($("#login > input[name=isLogin]").val() != 1)
            register();

        $(".submit-go").hide();
        $(".submit-load").show();

        setTimeout(() => {
            $("#login").submit();
        }, 2000);
    });
});

function register() {
    $('#login').attr('action', '/register');
}

function showLoginForm() {
    $("#logo").animate({ opacity: 1 }, 750);

    setTimeout(() => {
        $("#container").animate({ width: 482 }, 400);

        setTimeout(() => {
            $("#logo > h1").animate({ marginBottom: 35 }, 100);
            $("#login").animate({ opacity: 1 }, 300);
        }, 500);
    }, 1250);
}

function loginToSignUp() {
    $('#login > input[name=isLogin]').val(0);

    $('.login-p').hide();

    $('.signup-p').show();
    $('.signup-p').css({ opacity: 0 });
    $('.form-input.signup').animate({ opacity: 1}, 500, () => $(".signup-p").animate({ opacity: 1 }, 500));
    
    $('.form-input.signup').css("display", "inline-block");

    setTimeout(() => $('.submit-go, .submit-load').animate({ top: 125 }, 275), 150);
}

function signUpToLogin() {
    $('#login > input[name=isLogin]').val("1");

    $('.signup-p').hide();

    $(".form-input.signup").animate({ opacity: 0 }, 500, () => { 
        $('.form-input.signup').hide();

        $('.login-p').show();
        $('.login-p').css({ opacity: 0 });
        $('.login-p').animate({ opacity: 1}, 500);
    });

    $('.submit-go, .submit-load').animate({ top: 0 }, 275);
}

