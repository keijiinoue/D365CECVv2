/**
 * ForceGraphに関して、異なるスタイルのUIに共通のものをこのファイルでは扱う。
 */
namespace CV {
    /**
    * force layoutのノードのリストと同リンクのリストを扱うインタフェース
    * @interface
    */
    export interface NodesLinks {
        nodes: d3.layout.GraphNodeForce[];
        links: d3.layout.GraphNodeForce[];
    }

}
