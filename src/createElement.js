import { ELEMENT_TEXT } from './constant'
/**
 * 将jsx中html元素转化为虚拟dom
 * @param {*} type 标签名 如果是文本的话，传入一个常量来标识标签名
 * @param {*} props 传入的属性
 * @param  {...any} children 子元素列表
 */
function createElement (type, config, ...children) {
  delete config._owner // 删除babel转化是传过来的标识
  delete config._store
  return {
    type,
    props: {
      ...config,
      // 遍历所有子元素，判断子元素是不是React元素？ 不是React元素包装成React元素返回（比如文本字符串）
      children: children.map(child => {
        return typeof child === 'object' ? child : { 
          type: ELEMENT_TEXT,
          props: { text: child, children: [] } 
        }
      })
    }
  }
}

export default createElement