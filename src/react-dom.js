import { TAG_ROOT } from "./constant";
import scheduleRoot from './schedule'
/**
 * render是把一个元素渲染到另一个容器内部
 * @param {*} element 渲染元素
 * @param {*} container 渲染到另一元素
 */
function render (element, container) {
  let rootFiber = {
    tag: TAG_ROOT, // 每一个Fiber都会有一个tag属性来表示当前Fiber是什么类型
    stateNode: container, // 一般情况下元素如果是原生节点的话，stateNode指向真实DOM，后面会根据每个React元素创建Fiber
    props: { children: [element] } // props中children属性存放的是虚拟dom数组
  }
  scheduleRoot(rootFiber)
}

const ReactDOM = {
  render
}

export default ReactDOM