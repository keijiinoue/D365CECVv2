function Sandbox_UIChange_1() {
    console.log("in Sandbox_UIChange_1");

    var ctx = document.getElementById('MyCanvas').getContext('2d');

    ctx.font = "9pt Meiryo UI";

    // <line class="connectionLine" x1="733.5" y1="356" x2="1001.4250895307671" y2="488.1708434537529"></line>
    ctx.beginPath();
    ctx.moveTo(733, 356);
    ctx.lineTo(1001, 488);
    ctx.strokeStyle = "#D3D6DB";
    ctx.stroke();

    // <rect class="connectionMask" x="805.6422322653835" style="opacity: 1;" y="406.08542172687646" width="123.640625" height="20"></rect>
    ctx.rect(805, 406, 123, 20);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fill();

    // <text class="connectionDescription" x="809.6422322653835" y="422.08542172687646">OK大学時代のスキー部</text>
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("OK大学時代のスキー部", 809, 422);

    // <text class="connectionRole1" x="782.0422429227236" y="384">友人</text>
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("友人", 782, 384);

    // <text class="connectionRole2" x="927.8828669405576" y="460.17083740234375">友人</text>
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("友人", 927, 460);

}