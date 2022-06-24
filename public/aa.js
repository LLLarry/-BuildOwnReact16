import { ELEMENT_TEXT, PLACEMENT, TAG_HOST, TAG_ROOT, TAG_TEXT } from "../src/constant"
import { setProps } from '../src/utils'
/**
 * 从根节点开始渲染和调度 共有两个阶段：
 * 第一阶段： diff阶段 对比新旧的虚拟DOM，进行增量 更新或创建 render阶段；
 * 这个阶段比较花费时间，但是我们可以对任务进行拆分执行；此阶段可以暂停
 * render阶段有两个任务： 1、将虚拟dom树转化为fiber数据 2、收集effectlist依赖
 * 
 * 第二阶段： commit阶段：进行DOM更新创建阶段，此阶段不能暂停；要一气呵成
 * @param rootFiber 
 */
let nextUnitOfWork = null // 下一个工作单元
let workInProgressRoot = null // RootFiber应用的根
export default function scheduleRoot (rootFiber) {
  nextUnitOfWork = rootFiber
  workInProgressRoot = rootFiber
}

function performUnitOfWork (currentFiber) {
  console.log(currentFiber)
  // beginWork作用： 1、创建真实dom元素 2、创建子fiber
  beginWork(currentFiber)
  // 如果有儿子返回儿子节点
  if (currentFiber.child) {
    return currentFiber.child
  }
  // 走到这一步说明没有儿子节点，所以当前节点完成；并且 会按照规则找兄弟、找不到兄弟找叔叔
  while(currentFiber) {
    completeUnitOfWork(currentFiber) // 完成当前节点
    // 如果有兄弟，就返回兄弟
    if (currentFiber.sibling) {
      return currentFiber.sibling
    }
    // 走到这一步说明既没有儿子，也没有兄弟；那就找叔叔；找叔叔的话，我们将当前fiber的父节点作为currentFiber的值，那么在while循环中
    // 扎到父节点的兄弟节点就是当前节点的叔叔
    currentFiber = currentFiber.return
  }
}

/**
 * 在完成之后要收集副作用fiber，然后组成effect list
 * @param {*} currentFiber 
 */
function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return // 找到完成的任务的父亲
  if (returnFiber) {
    // 把自己的儿子的effect挂载到父节点
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }

    if (currentFiber.lastffect) {
      if (returnFiber.lastffect) {
        returnFiber.lastffect.nextEffect = currentFiber.firstEffect
      }
      returnFiber.lastffect = currentFiber.lastffect
    }

    // 把自己的effect挂到父节点
    const effectTag = currentFiber.effectTag
    if (effectTag) { // 自己的副作用
      // firstEffect指向第一个有副作用的fiber
      // lastEffect指向最后一个有副作用的fiber
      // 中间用nextEffect做成一个单链表
      if (!!returnFiber.lastffect) {
        returnFiber.lastffect.nextEffect = currentFiber
      } else {
        returnFiber.firstEffect = currentFiber
      }
      returnFiber.lastffect = currentFiber
    }
  }
}

/**
 * 作用： 1、创建真实dom元素 2、创建子fiber
 * @param {*} currentFiber 处理当前fiber
 */
function beginWork (currentFiber) {
  if (currentFiber.tag === TAG_ROOT) { // 根节点
    updateHostRoot(currentFiber)
  } else if (currentFiber.tag === TAG_TEXT) { // 文本节点
    updateHostText(currentFiber)
  } else if(currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber)
  }
}

/**
 * 处理tag类型为文本的fiber
 * @param {*} currentFiber 
 */
function updateHostText (currentFiber) {
  // 如果真实节点不存在，那么创建真实dom
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}

/**
 * 创建真实DOM
 * @param {*} currentFiber 
 */
function createDOM (currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text)
  } else if (currentFiber.tag === TAG_HOST) { // span div
    const stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  } 
}

function updateDOM(stateNode,oldProps,newProps) {
  setProps(stateNode,oldProps,newProps);
}

/**
 * 根据当前fiber，将当前fiber的子虚拟dom节点，生成对应的fiber
 * @param {*} currentFiber 当前fiber
 */
function updateHostRoot (currentFiber) {
  // 讲自己的子虚拟dom节点拿出来，依次遍历生成对应的fiber节点
  const newChildren = currentFiber.props.children
  // 处理子虚拟dom节点，生成对应的fiber
  reconcileChildren(currentFiber, newChildren)
}

function updateHost (currentFiber) {
  if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
      currentFiber.stateNode = createDOM(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber,newChildren);
}

/**
 * 处理子虚拟dom节点，生成对应的fiber
 * @param {*} currentFiber 
 * @param {*} newChildren 
 */
function reconcileChildren (currentFiber, newChildren) {
  let newChildIndex  = 0 // 新自节点的索引
  let prevSibling // 上一个新的子fiber
  while (newChildIndex < newChildren.length) {
    const newChild = newChildren[newChildIndex] // 正在处理的子虚拟dom节点
    let tag
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT // 这是一个文本节点
    } else if (typeof newChild.type === 'string') {
      tag = TAG_HOST // 这是一个原生DOM节点
    }

    // 根据虚拟dom生成对应的fiber节点
    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null, // 当前节点的真实dom还没创建
      return: currentFiber, // 父fiber节点
      effectTag: PLACEMENT, // 副作用标识 render会收集副作用： 插入、更新、删除
      nextEffect: null, // effect list是个单链表
    }

    if (newFiber) {
      if (newChildIndex === 0) { // 父Fiber的child属性指向第一个节点
        currentFiber.child = newFiber
      } else { // 上一个节点的sibling属性执行当前fible
        prevSibling.sibling = newFiber
      }
      // 保存当前当前fible作为下次使用 
      prevSibling = newChild
    
    }
    newChildIndex++
  }
}

/**
 * 循环调用根fiber的nextEffect来获取所有收集到的依赖； 通过调用commitWork来进行更新DOM
 */
function commitRoot () {
  let currentFiber = workInProgressRoot.firstEffect
  while (currentFiber) {
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  workInProgressRoot = null
}

/**
 * 根据fiber的副作用来进行更新DOM（插入、删除、更新）
 * @param currentFiber 
 * @returns 
 */
function commitWork (currentFiber) {
  if (!currentFiber) return
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode)
  }
  currentFiber.effectTag = null
}



requestIdleCallback(workLoop, { timeout: 500 })

function workLoop (deadline) {
  let shouleYield = false // 是否要让出时间片或者执行权
  while (nextUnitOfWork && !shouleYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork) // 执行一个任务完成后，返回一个新任务
    shouleYield = deadline.timeRemaining() < 1 // 小于1，表示没有空闲时间了，让出控制权
  }
  // 走到这一步说明nextUnitOfWork（执行任务）执行完了或者空闲时间不够了
  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('render阶段结束')
    commitRoot()
  } else { // 这一步说明任务任务还没执行完，而是执行完了或者空闲时间不够了；所以我们在下一帧的空闲时间执行任务
    requestIdleCallback(workLoop, { timeout: 500 })
  }
}