$(function() {
    showLoginForm();

    $('#submit-go').click((e) => {
        $('#submit-go').fadeOut(200, function() {
            $('#submit-go').hide();
            $('#submit-load').css("display", "inline-block");
        });
    });
});

function showLoginForm() {
    $("#logo").animate({ opacity: 1 }, 750);

    setTimeout(function() {
        $("#logo").animate({ marginBottom: 35 }, 400);
        $("#container").animate({ width: 487 }, 400);

        setTimeout(function() {
            $("#login").animate({ opacity: 1 }, 300);
        }, 500);
    }, 1250);
}