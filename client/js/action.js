var jsdom = require(jsdom);
const {JSDOM} = jsdom;
const dom = new JSDOM(html);
const $ = (require('jquery'))(dom.window);
$("login_action").click((e) =>{
    alert("allo");
});