/// <reference path="CV.Config.ts" />
/// <reference path="CV.CardControl.ts" />
/// <reference path="CV.ConnectorControl.ts" />
/// <reference path="CV.Helper.ts" />
/// <reference path="CV.ConnectionViewer.ts" />
/// <reference path="../../scripts/typings/d3/d3.d.ts" />
/// <reference path="cv.forcegraph_common.ts" />
/// <reference path="typings/my.d3.d.ts" />
var CV;
(function (CV) {
    /**
    * 力学モデルで表現するオブジェクトを管理するクラス。
    * カードの描画は長方形。
    * d3.jsのforce layoutを使用。
    * @class
    */
    var ForceGraph_RectangleUI = (function () {
        /**
        * 力学モデルで表現するオブジェクトのコンストラクタ
        * @constructor
        * @param connectionMaskToClickElementId {string} つながりの説明文をクリックできる領域(<a>)群を格納する領域を示すHTML要素のId
        */
        function ForceGraph_RectangleUI(elementId, connectionMaskToClickElementId) {
            /**
            * 現在フォーカスされているカードのCRMレコードのID
            * @property
            */
            this.currentFocusedCardID = null;
            /**
            * 現在のイベント処理中のd3オブジェクト
            * @property
            */
            this.currentEventD3obj = null;
            this.force = d3.layout.force();
            this.forceList = { nodes: this.force.nodes(), links: this.force.links() };
            this.divForCards = d3.select(elementId); // カードやつながりを描画するエリア
            this.connectionMaskToClickVis = d3.select(connectionMaskToClickElementId); // つながりの説明文をクリックできる領域(<a>)群を格納するエリア
            this.svg = d3.select("svg")
                .attr("width", window.innerWidth).attr("height", window.innerHeight);
            d3.select("#MySVG").attr("pointer-events", "none");
        }
        /**
        * ノードを追加する。
        * d3で扱うidの文字列は、数字で始まってはいけない可能性があり、格納するidにはprefixを付与する。
        * 引数でxとyを指定しなかった場合には、固定しない。
        * @function
        * @param nodeObj 名前とIDとiconURLとxとy。xとyは明示的に指定する場合以外はnullでよい。なお、entityImageは、CircleUIとの互換性のために必要だが、使用しない。
        */
        ForceGraph_RectangleUI.prototype.addNode = function (nodeObj) {
            if (nodeObj.x && nodeObj.y) {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    x: nodeObj.x,
                    y: nodeObj.y,
                    fixed: nodeObj.fixed,
                    entityName: nodeObj.entityName
                });
            }
            else {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    entityName: nodeObj.entityName
                });
            }
            this.refresh(nodeObj);
        };
        /**
        * リンク（つながり）を追加する。
        * @function
        * @param linkObj つながり元のID、つながり先のID、CRMLinkインスタンスのLinkId、つながりの説明、つながりロール1表示名、つながりロール2表示名
        */
        ForceGraph_RectangleUI.prototype.addLink = function (linkObj) {
            var foundSource = this.findNode(CV.IDPrefix + linkObj.source);
            var foundTarget = this.findNode(CV.IDPrefix + linkObj.target);
            if (foundSource != null && foundTarget != null) {
                this.forceList.links.push({
                    source: foundSource,
                    target: foundTarget,
                    id: linkObj.linkId,
                    description: linkObj.description,
                    role1: linkObj.role1,
                    role2: linkObj.role2,
                    connector: linkObj.connector
                });
                this.refresh(null);
            }
        };
        /**
        * 1つのリンク（つながり）において、複数のCRMLinkインスタンスが関係付くことが分かった処理をする。
        * パラメータで渡されたCRMLinkのLinkIdが既存のリンク群のうちのどれかを検索するが、
        * リンクが作成された最初に指定したCRMLinkが渡されているという前提である。
        * @function
        * @param crmLink {CRMLink} CRMLinkインスタンス
        */
        ForceGraph_RectangleUI.prototype.setMultipleCRMConnetionFound = function (crmLink) {
            var found = false;
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link["id"] == crmLink.LinkId) {
                    link["description"] = crmLink.Connector.Description;
                    link["role1"] = crmLink.Connector.Role1;
                    link["role2"] = crmLink.Connector.Role2;
                    link["connector"] = crmLink.Connector;
                    found = true;
                }
            }
            if (found) {
                // リンクの説明文
                this.updateForceConnectionDescription();
                this.updateForceConnectionMaskToClick();
                this.updateForceConnectionRole1();
                this.updateForceConnectionRole2();
            }
        };
        /**
        * IDでthis.forceListを検索してノードを返す。
        * @function
        * @param prefixedId {string} NodeのID。prefix付き。
        * @return 検索してヒットしたノード。ヒットしなければnullを返す。
        */
        ForceGraph_RectangleUI.prototype.findNode = function (prefixedId) {
            for (var i in this.forceList.nodes) {
                if (this.forceList.nodes[i]["id"] == prefixedId)
                    return this.forceList.nodes[i];
            }
            return null;
        };
        /**
        * サイズが変更された際の処理をする。
        * @function
        */
        ForceGraph_RectangleUI.prototype.setForceSizeAndStart = function () {
            d3.selectAll("#MySVG")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight);
            $("#MyCanvasToDrag")
                .css("width", window.innerWidth + "px")
                .css("height", window.innerHeight + "px");
            this.force.size([window.innerWidth, window.innerHeight])
                .linkDistance(CV.ConnectionViewer.CARD_DISTANCE)
                .charge(-5000)
                .start();
        };
        /**
        * force.on("tick", ...) の処理をする。
        * @function
        */
        ForceGraph_RectangleUI.prototype.setForceOnTick = function (forceConnectionLine, forceConnectionMask, forceConnectionMaskToClick, forceConnectionDescription, forceConnectionRole1, forceConnectionRole2, forceNodeCard) {
            this.force.on("tick", function () {
                forceConnectionLine
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
                forceConnectionMask
                    .attr("x", function (d, i) { return (d.source.x + d.target.x) / 2 - forceConnectionDescription[0][i].getBBox().width / 2 - 4; })
                    .attr("y", function (d, i) { return (d.source.y + d.target.y) / 2 - forceConnectionDescription[0][i].getBBox().height; })
                    .attr("width", function (d, i) { return forceConnectionDescription[0][i].getBBox().width + 8; })
                    .attr("height", function (d, i) { return forceConnectionDescription[0][i].getBBox().height + 4; });
                forceConnectionMaskToClick
                    .style("left", function (d, i) {
                    var x = Math.floor(forceConnectionMask[0][i].x.baseVal.value) + 4;
                    return x + "px";
                })
                    .style("top", function (d, i) {
                    var y = Math.floor(forceConnectionMask[0][i].y.baseVal.value) + 4; // 何故か +4 しないと表示がずれる。
                    return y + "px";
                });
                forceConnectionDescription
                    .attr("x", function (d, i) { return (d.source.x + d.target.x) / 2 - forceConnectionDescription[0][i].getBBox().width / 2; })
                    .attr("y", function (d, i) { return (d.source.y + d.target.y) / 2; }); // フォント下部の位置を指定するため、getBBox().height/2の処理はなくても良い。
                forceConnectionRole1
                    .attr("x", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole1[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, false).x;
                })
                    .attr("y", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole1[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, false).y;
                });
                forceConnectionRole2
                    .attr("x", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole2[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, true).x;
                })
                    .attr("y", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole2[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, true).y;
                });
                forceNodeCard
                    .style("left", function (d) {
                    var x = d.x - CV.CardControl.CARD_WIDTH / 2;
                    return x + "px";
                })
                    .style("top", function (d) {
                    var y = d.y - CV.CardControl.CARD_HEIGHT / 2;
                    return y + "px";
                });
            });
        };
        /**
        * つながりの線を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながりの線を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionLine = function () {
            var forceConnectionLine = this.svg.selectAll("line.connectionLine")
                .data(this.forceList.links);
            forceConnectionLine.enter().append("line")
                .classed("connectionLine", true);
            forceConnectionLine.exit().remove();
            return forceConnectionLine;
        };
        /**
        * つながりの説明文を表示する際に、つながりの線をマスクして説明文を読みやすくする。
        * そのマスクを表すd3.Selectionを作成し、取得する。
        * @function
        * @return マスクを表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionMask = function () {
            var forceConnectionMask = this.svg.selectAll("rect.connectionMask")
                .data(this.forceList.links);
            forceConnectionMask.enter().append("rect")
                .classed("connectionMask", true)
                .style("opacity", function (d, i) {
                // 該当するつながりの説明文が""の時には透明にする。
                return (d.connector.Description == null || d.connector.Description == "") ? 0.0 : 1.0;
            });
            forceConnectionMask.exit().remove();
            return forceConnectionMask;
        };
        /**
        * つながりの説明文をクリックできる<a>領域を表すd3.Selectionを作成し、取得する。
        * jQuery Mobileの機能を使いたいために、svg外でその領域を確保する目的がある。
        * @function
        * @return つながりの説明文をクリックできる<a>領域を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionMaskToClick = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            var forceConnectionMaskToClick = this.connectionMaskToClickVis.selectAll("a.connectionMaskToClick")
                .data(this.forceList.links);
            forceConnectionMaskToClick.enter().append("a")
                .classed("connectionMaskToClick", true)
                .attr("href", "#MyMultipleCRMLinkPanel")
                .attr("data-role", "button")
                .attr("role", "button")
                .style("visibility", function (d, i) {
                // 該当するつながりの説明文が""の時には表示しない。
                return (d.connector.Description == null || d.connector.Description == "") ? "hidden" : "visible";
            })
                .html(function (d, i) {
                var w = Math.floor(forceConnectionDescription[0][i].getBBox().width);
                var h = Math.floor(forceConnectionDescription[0][i].getBBox().height);
                return '<div style="width: ' + w + 'px; height: ' + h + 'px; background-color: rgba(255,128,0,0.0);"></div>'; // 透明だがクリックできる状態
            })
                .on("touchstart", this.connectionMaskToClickTouchPointerMouseStart) // タッチ用
                .on("pointerdown", this.connectionMaskToClickTouchPointerMouseStart) // PCでのIE用
                .on("mousedown", this.connectionMaskToClickTouchPointerMouseStart); // PCでのChromeやFirefox用
            forceConnectionMaskToClick.exit().remove();
            return forceConnectionMaskToClick;
        };
        /**
        * つながりの説明文をクリックできる<a>領域を表すd3.Selectionを最新状態に更新する。
        * @function
        */
        ForceGraph_RectangleUI.prototype.updateForceConnectionMaskToClick = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            var forceConnectionMaskToClick = this.connectionMaskToClickVis.selectAll("a.connectionMaskToClick")
                .data(this.forceList.links);
            forceConnectionMaskToClick
                .style("visibility", function (d, i) {
                // 該当するつながりの説明文が""の時には表示しない。
                return (d.connector.Description == null || d.connector.Description == "") ? "hidden" : "visible";
            })
                .html(function (d, i) {
                var w = Math.floor(forceConnectionDescription[0][i].getBBox().width);
                var h = Math.floor(forceConnectionDescription[0][i].getBBox().height);
                return '<div style="width: ' + w + 'px; height: ' + h + 'px; background-color: rgba(255,128,0,0.0);"></div>'; // 透明だがクリックできる状態
            });
            forceConnectionMaskToClick.exit().remove();
        };
        /**
        * つながりの説明文を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながりの説明文を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionDescription = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            forceConnectionDescription.enter().append("text")
                .classed("connectionDescription", true)
                .text(function (d) { return d.description; });
            forceConnectionDescription.exit().remove();
            return forceConnectionDescription;
        };
        /**
        * つながりの説明文を表すd3.Selectionを最新状態に更新する。
        * @function
        */
        ForceGraph_RectangleUI.prototype.updateForceConnectionDescription = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            forceConnectionDescription.text(function (d) { return d.description; });
            forceConnectionDescription.exit().remove();
        };
        /**
        * つながり1を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながり1を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionRole1 = function () {
            var forceConnectionRole1 = this.svg.selectAll("text.connectionRole1")
                .data(this.forceList.links);
            forceConnectionRole1.enter().append("text")
                .classed("connectionRole1", true)
                .text(function (d) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        /**
        * つながり1を表すd3.Selectionを更新する。
        * @function
        * @return つながり1を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.updateForceConnectionRole1 = function () {
            var forceConnectionRole1 = this.svg.selectAll("text.connectionRole1")
                .data(this.forceList.links);
            forceConnectionRole1
                .text(function (d) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        /**
        * つながり2を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながり2を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionRole2 = function () {
            var forceConnectionRole2 = this.svg.selectAll("text.connectionRole2")
                .data(this.forceList.links);
            forceConnectionRole2.enter().append("text")
                .classed("connectionRole2", true)
                .text(function (d) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        /**
        * つながり2を表すd3.Selectionを更新する。
        * @function
        * @return つながり2を表すd3.Selection
        */
        ForceGraph_RectangleUI.prototype.updateForceConnectionRole2 = function () {
            var forceConnectionRole2 = this.svg.selectAll("text.connectionRole2")
                .data(this.forceList.links);
            forceConnectionRole2
                .text(function (d) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        /**
        * コネクタの説明文をクリックできる<a>領域を表すd3.Selectionについて、
        * タッチ操作など開始のイベントリスナー。touchstart、pointerdown、mousedownすべて。
        * @param d this.forceList.linksの1つの要素。
        */
        ForceGraph_RectangleUI.prototype.connectionMaskToClickTouchPointerMouseStart = function (d, i) {
            ///console.log("in connectionMaskToClickTouchPointerMouseStart");
            ///console.log("d, i, this", d, i, this);
            d3.event.preventDefault(); // 2度このfunctionが呼ばれるのを防ぐ。
            $("#MyMultipleLlinksRecordDisplayNameLeft").html(d.connector.Card1.DisplayName);
            $("#MyMultipleLlinksRecordDisplayNameRightt").html(d.connector.Card2.DisplayName);
            $("#MyMultipleLlinksEntityDisplayNameLeft").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[d.connector.Card1.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            $("#MyMultipleLlinksEntityDisplayNameRight").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[d.connector.Card2.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            var html = '';
            for (var l in d.connector.CrmLinkArray) {
                var crmLink = d.connector.CrmLinkArray[l];
                var r1 = (crmLink.Record1DisplayRoleName) ? crmLink.Record1DisplayRoleName : "・";
                var r2 = (crmLink.Record2DisplayRoleName) ? crmLink.Record2DisplayRoleName : "・";
                var desc = (crmLink.ConnectionType == CV.CRMLinkTypeEnum.ManyToMany) ? "(N:N関係)" : crmLink.Description;
                if (desc) {
                    html += '<table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '    <tr>';
                    html += '        <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: center;"><p class="multipleLlinksDescription">' + desc + '</p></td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '    </tr>';
                    html += '</table>';
                }
                else {
                    html += '                    <table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '                        <tr>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '                            <td class="multipleLlinksTD" style="width: 100%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '                        </tr>';
                    html += '                    </table>';
                }
            }
            $("#MyMyMultipleCRMLinkPanelAllLinks").html(html);
            $("#MyShowMultipleCRMLinkPanel").click();
        };
        /**
        * タッチ操作など開始のイベントリスナー。touchstart、pointerdown、mousedownすべて。
        * @param d d3のdiv.card セレクション
        */
        ForceGraph_RectangleUI.prototype.touchPointerMouseStart = function (d) {
            ///console.log("in touchPointerMouseStart");
            if (!CV.forceGraph.currentEventD3obj) {
                // 当該d3オブジェクトが他のイベントでの処理がまだなされていない場合。
                CV.forceGraph.currentEventD3obj = d;
                CV.forceGraph.dragStartedPoint = new CV.Helper.Point(d.x, d.y);
                CV.forceGraph.focusACardControl(d);
            }
        };
        /**
        * タッチ操作など終了のイベントリスナー。touchend、pointerup、mouseupすべて。
        * @param d d3のdiv.card セレクション
        */
        ForceGraph_RectangleUI.prototype.touchPointerMouseEnd = function (d) {
            ///console.log("in touchPointerMouseEnd");
            CV.forceGraph.currentEventD3obj = null;
        };
        /**
        * タップホールド（マウスクリック長押し）した際のイベントを処理を実装する。
        * カードをドラッグ中も呼び出されるので、そのハンドリングもしている。
        * @param event jQueryの"taphold"イベントで呼び出され渡されるもの
        */
        ForceGraph_RectangleUI.prototype.taphold = function (event) {
            ///console.log("in taphold");
            var cardEl;
            if (event.target.className == "card") {
                cardEl = event.target;
            }
            else {
                cardEl = $(event.target).parents(".card")[0];
            }
            var id = cardEl.id; // prefix付きのカードDIV要素のID
            var d3obj = this.findNode(id);
            var currentPoint = new CV.Helper.Point(d3obj.x, d3obj.y);
            // ドラッグしているのか、長押ししているだけなのかを判断する。
            var dx = currentPoint.x - CV.forceGraph.dragStartedPoint.x;
            var dy = currentPoint.y - CV.forceGraph.dragStartedPoint.y;
            if (dx * dx + dy * dy < 100) {
                // ドラッグせずに、長押ししている
                CV.forceGraph.cardToggleFixed(d3obj);
            }
            else {
                // ドラッグして、長押ししている
                CV.forceGraph.cardFixed(d3obj);
            }
        };
        /**
        * 指定したカードについて、d3 forceの挙動を固定するか、固定しないかオンオフする。
        * d3obj.fixedの1ビット目で管理している。
        * CardsLayoutManager で管理されるところのカードの固定のオン／オフのための処理も扱う。
        * @param d3obj カードを表すd3オブジェクト
        */
        ForceGraph_RectangleUI.prototype.cardToggleFixed = function (d3obj) {
            ///console.log("in cardToggleFixed() d3obj.fixed = ", d3obj.fixed);
            var cardDiv = $("#" + d3obj.id);
            if (!(d3obj.fixed & 1)) {
                cardDiv.css("box-shadow", "4px 4px 6px 2px rgba(0,0,0,0.5)");
                d3obj.fixed |= 1; // fixedをオン
            }
            else {
                cardDiv.css("box-shadow", "none");
                d3obj.fixed &= ~1; // fixedをオフ
            }
        };
        /**
        * 指定したカードについて、d3 forceの挙動を固定する。
        * d3obj.fixedの1ビット目で管理している。
        * @param d3obj カードを表すd3オブジェクト
        */
        ForceGraph_RectangleUI.prototype.cardFixed = function (d3obj) {
            ///console.log("in cardFixed() d3obj.fixed = ", d3obj.fixed);
            var cardDiv = $("#" + d3obj.id);
            cardDiv.css("box-shadow", "4px 4px 6px 2px rgba(0,0,0,0.5)");
            d3obj.fixed |= 1; // fixedをオン
        };
        /**
        * 表示をリフレッシュする。
        * 引数は、直近でthis.forceListに追加したものがnodeのオブジェクトである場合に渡されるべきものであり、
        * もし追加したものがlinkのオブジェクト、またはlinkを変更したものであればnullを渡してよい。
        * @param nodeObj 名前とIDとiconURL
        * @function
        */
        ForceGraph_RectangleUI.prototype.refresh = function (nodeObj) {
            var forceConnectionLine = this.appendAndGetForceConnectionLine();
            var forceConnectionMask = this.appendAndGetForceConnectionMask();
            var forceConnectionDescription = this.appendAndGetForceConnectionDescription();
            var forceConnectionMaskToClick = this.appendAndGetForceConnectionMaskToClick();
            var forceConnectionRole1 = this.appendAndGetForceConnectionRole1();
            var forceConnectionRole2 = this.appendAndGetForceConnectionRole2();
            var forceNodeCard = this.divForCards.selectAll("div.card")
                .data(this.forceList.nodes);
            var nodeEnter = forceNodeCard.enter()
                .append("div") // カードの全体
                .attr("id", function (d) { return d.id; }) // d.idにはすでにprefix付き。
                .classed("card", true)
                .style("outline-color", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .style("position", "absolute")
                .style("box-shadow", function (d) { return (d.fixed) ? "4px 4px 6px 2px rgba(0,0,0,0.5)" : "none"; })
                .style("cursor", "move")
                .on("touchstart", this.touchPointerMouseStart) // タッチ用
                .on("touchend", this.touchPointerMouseEnd) // タッチ用
                .on("pointerdown", this.touchPointerMouseStart) // PCでのIE用
                .on("pointerup", this.touchPointerMouseEnd) // PCでのIE用
                .on("mousedown", this.touchPointerMouseStart) // PCでのChromeやFirefox用
                .on("mouseup", this.touchPointerMouseEnd); // PCでのChromeやFirefox用
            // タップホールド（マウスクリック長押し）した際のイベントを設定する。これは jQuery Mobile を利用する。
            if (nodeObj) {
                // もし直近でnodeのオブジェクトが渡された場合にのみ行う。
                $("#" + CV.IDPrefix + nodeObj.id).bind("taphold", function (event) { CV.forceGraph.taphold(event); });
            }
            nodeEnter = nodeEnter
                .call(this.force.drag);
            nodeEnter
                .append("span") // カードの画像を内包する部分
                .classed("cardImageWrapper", true)
                .style("background-color", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .style("cursor", "move")
                .append("img")
                .classed("cardImage", true)
                .attr("src", function (d) { return d.iconURL; });
            nodeEnter
                .append("span") // カードのタイトル（表示名）部分
                .classed("cardTitle", true)
                .attr("title", function (d) { return d.name; })
                .attr("onclick", "CV.CardControl.OpenNewCRMFormWindow(this)")
                .text(function (d) { return d.name; });
            nodeEnter
                .append("span") // カードのToBeRetrieved表示「…」部分
                .classed("cardToBeRetrieved", true)
                .style("cursor", "move")
                .text("…");
            forceNodeCard.exit().remove();
            this.setForceOnTick(forceConnectionLine, forceConnectionMask, forceConnectionMaskToClick, forceConnectionDescription, forceConnectionRole1, forceConnectionRole2, forceNodeCard);
            this.setForceSizeAndStart();
        };
        /**
        * 特定のカードをフォーカス表示する。引数はCRMレコードのid
        * 既にフォーカス状態のカードがあれば、それをアンフォーカスする処理も行う。
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_RectangleUI.focusACardControlByCRMRecordId = function (id) {
            if (CV.forceGraph.currentFocusedCardID != id) {
                //既にフォーカス状態のカードがあれば、それをアンフォーカスする
                if (CV.forceGraph.currentFocusedCardID != null) {
                    for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                        if (CV.connectionViewer.CRMRecordArray[i].Id == CV.forceGraph.currentFocusedCardID) {
                            CV.connectionViewer.CRMRecordArray[i].Card.Unfocus();
                            break;
                        }
                    }
                }
                CV.forceGraph.currentFocusedCardID = id;
                // UIとしてのフォーカス処理
                if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                    d3.select("div.card#" + CV.IDPrefix + id).style("outline-width", "3px");
                }
            }
        };
        /**
        * 特定のカードをアンフォーカス表示する。引数はCRMレコードのid
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_RectangleUI.unfocusACardControlByCRMRecordId = function (id) {
            //アンフォーカス
            if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                d3.select("div.card#" + CV.IDPrefix + id).style("outline-width", "1px");
            }
        };
        /**
        * 特定のカードをフォーカスする。引数はd3セレクション
        * 既にフォーカス状態のカードがあれば、それをアンフォーカスする処理も行う。
        * @function
        * @param d d3 div.card セレクション
        */
        ForceGraph_RectangleUI.prototype.focusACardControl = function (d) {
            ///console.log("in focusACardControl d.id=" + d.id);
            // d.idからprefixを取り除いてから処理する
            if (d.id.indexOf(CV.IDPrefix) == 0) {
                var id = d.id.substr(CV.IDPrefix.length);
                // 既にフォーカスされている場合には何もしない。
                if (CV.forceGraph.currentFocusedCardID == id)
                    return;
                // 該当するCRMRecordを見つけて、そのカードコントロールをフォーカスする。
                for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                    var crmRecord = CV.connectionViewer.CRMRecordArray[i];
                    if (crmRecord.Id == id) {
                        crmRecord.Card.Focus();
                        break;
                    }
                }
            }
        };
        /**
        * 特定のカードについて、「関連するつながりデータを取得済みである」状態の表示を変更する。
        * booleanの引数がtrueだと取得済みである状態の表示に、falseだと取得済みではない状態の表示にする。
        * 引数はCRMレコードのid
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_RectangleUI.prototype.connectionRetrieved = function (id, retrieved) {
            ///console.log("in connectionRetrieved() CRM record id=" + id);
            if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                if (retrieved) {
                    d3.select("div.card#" + CV.IDPrefix + id).select("span.cardToBeRetrieved").style("opacity", "0.0");
                }
                else {
                    d3.select("div.card#" + CV.IDPrefix + id).select("span.cardToBeRetrieved").style("opacity", "1.0");
                }
            }
        };
        /**
        * つながりロールの文字列のTextBlockを適切な位置に配置する。
        * @param connectionRole d3.jsのconnectionRole1あるいはconnectionRole2オブジェクト
        * @param reverse role1のカードを処理する場合はfalse、role2のカードを処理する場合はtrue
        * @param X1 connectionRole1のオブジェクトのx位置
        * @param Y1 connectionRole1のオブジェクトのy位置
        * @param X2 connectionRole2のオブジェクトのx位置
        * @param Y2 connectionRole2のオブジェクトのy位置
        * @return 表示すべき位置を表す Helper.Point
        */
        ForceGraph_RectangleUI.UpdatePositionARole = function (connectionRole, X1, Y1, X2, Y2, reverse) {
            var returnPoint = new CV.Helper.Point(0, 0);
            // コネクターの線を1次直線y=ax+bに置く
            // 座標は、X1, Y1を中心 (0, 0) とした場合の計算である。
            // よって、y=ax+bにおけるbは常に0である。
            // reverse = trueの場合には、X2, Y2を中心 (0, 0) とした場合
            var dx = (!reverse) ? X2 - X1 : X1 - X2;
            var dy = (!reverse) ? Y2 - Y1 : Y1 - Y2;
            var a;
            if (dx != 0)
                a = dy / dx;
            else
                a = null;
            // angleの値は、-PI < angle <= PI
            var angle = Math.atan2(dy, dx);
            // 確定した接点。座標は、X1, Y1を中心 (0, 0) としたもの。
            var contactPoint = new CV.Helper.Point(0, 0);
            // カードの四角との接点のX、Yを取得する。
            ForceGraph_RectangleUI.GetCardContactXAndY(a, angle, contactPoint);
            // 右下方向への向きの場合
            if (0.0 < angle && angle <= Math.PI / 2.0) {
                returnPoint.x = contactPoint.x + 8.0;
                if (contactPoint.x == CV.CardControl.CARD_WIDTH / 2.0)
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height - 6.0;
                else
                    returnPoint.y = contactPoint.y + 8.0;
            }
            else if (Math.PI / 2.0 < angle && angle <= Math.PI) {
                returnPoint.x = contactPoint.x - connectionRole.getBBox().width - 8.0;
                returnPoint.y = contactPoint.y + 8.0;
            }
            else if (-Math.PI < angle && angle <= -Math.PI / 2.0) {
                returnPoint.x = contactPoint.x - connectionRole.getBBox().width - 8.0;
                if (contactPoint.y == -CV.CardControl.CARD_HEIGHT / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height + 6.0;
            }
            else {
                returnPoint.x = contactPoint.x + 8.0;
                if (contactPoint.y == -CV.CardControl.CARD_HEIGHT / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else if (contactPoint.x == CV.CardControl.CARD_WIDTH / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height + 6.0;
            }
            // 最後に、座標の中心を考慮して、移動する。
            returnPoint.x += (!reverse) ? X1 : X2;
            returnPoint.y += (!reverse) ? Y1 : Y2;
            return returnPoint;
        };
        /// カードの四角との接点のX、Yを求める。
        /// 座標は、カードの中心を (0 ,0) としたものである。
        ForceGraph_RectangleUI.GetCardContactXAndY = function (a, angle, contactPoint) {
            // チェックする接点
            var tryContactX, tryContactY;
            //// 接点を確認する。
            // 右下方向への向きの場合
            if (0.0 < angle && angle <= Math.PI / 2.0) {
                // 右辺の接点を調査
                tryContactY = (a != null) ? a * CV.CardControl.CARD_WIDTH / 2.0 : null;
                // 下辺の接点を調査
                tryContactX = (a != null) ? ((a == 0.0) ? null : CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                // 右辺の接点を採用できる状態か
                if (tryContactY != null && tryContactY <= CV.CardControl.CARD_HEIGHT / 2.0) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else if (Math.PI / 2.0 < angle && angle <= Math.PI) {
                // 左辺の接点を調査
                tryContactY = (a != null) ? a * -CV.CardControl.CARD_WIDTH / 2.0 : null;
                // 下辺の接点を調査
                tryContactX = (a != null) ? ((a == 0.0) ? null : CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                // 左辺の接点を採用できる状態か
                if (tryContactY != null && tryContactY <= CV.CardControl.CARD_HEIGHT / 2.0) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = -CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else if (-Math.PI < angle && angle <= -Math.PI / 2.0) {
                // 左辺の接点を調査
                tryContactY = (a != null) ? a * -CV.CardControl.CARD_WIDTH / 2.0 : null;
                // 上辺の接点を調査
                tryContactX = (a != null) ? ((a == 0.0) ? null : -CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                // 左辺の接点を採用できる状態か
                if (tryContactY != null && -CV.CardControl.CARD_HEIGHT / 2.0 <= tryContactY) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = -CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = -CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else {
                // 右辺の接点を調査
                tryContactY = (a != null) ? a * CV.CardControl.CARD_WIDTH / 2.0 : null;
                // 上辺の接点を調査
                tryContactX = (a != null) ? ((a == 0.0) ? null : -CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                // 右辺の接点を採用できる状態か
                if (tryContactY != null && -CV.CardControl.CARD_HEIGHT / 2.0 <= tryContactY) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = -CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
        };
        /**
         * キャンバスをドラッグする処理の初期化
         */
        ForceGraph_RectangleUI.prototype.initCanvasToDrag = function () {
            /**
             * MyCanvasToDrag にてマウス操作のドラッグ＆ドロップを検知して、
            * 実際の描画は MyCardConnectionDiv の位置にて操作する。
             */
            // カードをドラッグ中でないことを確認
            if (!CV.forceGraph.currentEventD3obj) {
                var drag = d3.behavior.drag()
                    .on("dragstart", function (d) {
                    this.isNowDragging = true;
                }).on("drag", function (d) {
                    if (this.isNowDragging) {
                        d3.event.sourceEvent.stopPropagation(); // silence other listeners
                        CV.forceGraph.moveCanvasPosition(d3.event.dx, d3.event.dy);
                    }
                }).on("dragend", function (d) {
                    this.isNowDragging = false;
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                });
                // 初期値の設定
                CV.forceGraph.setCanvasPosition(0, 0);
                // マウス操作を検知する対象にdragを設定
                d3.select("#MyCanvasToDrag").call(drag);
            }
        };
        /**
         * キャンバスの位置を指定の位置にセットする。
         * MyCanvasToDrag に位置を記録し、
         * MyCardConnectionDiv で実際の描画をセットする。
         * @param x
         * @param y
         */
        ForceGraph_RectangleUI.prototype.setCanvasPosition = function (x, y) {
            // 位置を記録する要素に属性値を設定
            d3.select("#MyCanvasToDrag")
                .attr("data-dragx", x) // ドラッグしたx位置を管理するための独自の属性。MyCanvasToDrag自身は移動しない。
                .attr("data-dragy", y); // ドラッグしたy位置を管理するための独自の属性。MyCanvasToDrag自身は移動しない。
            // 実際の描画
            d3.select("#MyCardConnectionDiv")
                .style("left", x + "px")
                .style("top", y + "px");
        };
        /**
         * 現在のキャンバスの位置を取得する。
         */
        ForceGraph_RectangleUI.prototype.getCanvasPosition = function () {
            var x = parseInt(d3.select("#MyCanvasToDrag").attr("data-dragx"));
            var y = parseInt(d3.select("#MyCanvasToDrag").attr("data-dragy"));
            return new CV.Helper.Point(x, y);
        };
        /**
         * キャンバスの位置を指定の位置に変位量だけ移動する。
         * MyCanvasToDrag に位置を記録し、
         * MyCardConnectionDiv で実際の描画をセットする。
         * @param dx
         * @param dy
         */
        ForceGraph_RectangleUI.prototype.moveCanvasPosition = function (dx, dy) {
            d3.select("#MyCardConnectionDiv")
                .style("left", function () {
                var x = parseInt($("#MyCanvasToDrag").attr("data-dragx")) + dx;
                $("#MyCanvasToDrag").attr("data-dragx", x);
                return x + "px";
            })
                .style("top", function () {
                var y = parseInt($("#MyCanvasToDrag").attr("data-dragy")) + dy;
                $("#MyCanvasToDrag").attr("data-dragy", y);
                return y + "px";
            });
        };
        /**
         * カード内のタイトルをクリックした際に渡されるDOM上のelmを受け取り、
         * 対象となるCRMRecordのidを返す。
         * @param elm
         */
        ForceGraph_RectangleUI.prototype.getIdFromTitle = function (elm) {
            return $(elm).closest("div")[0].id;
        };
        /**
         * フォーカスしているカードからみて遠くにあるカードのUIのサイズを小さく変更する。
         * RectangleUI では、未実装。
         */
        ForceGraph_RectangleUI.prototype.changeUISizeForFarCards = function () {
            // 未実装
        };
        return ForceGraph_RectangleUI;
    }());
    CV.ForceGraph_RectangleUI = ForceGraph_RectangleUI;
})(CV || (CV = {}));
//# sourceMappingURL=cv.forcegraph_rectangleui.js.map