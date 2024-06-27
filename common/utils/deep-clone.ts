/* eslint-disable @typescript-eslint/no-explicit-any */
function deepClone<T>(obj: T): T {
  // 检查是否为原始值
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  // 处理正则表达式对象
  if (obj instanceof RegExp) {
    return new RegExp(obj) as any
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const arrCopy = [] as any[]
    for (const item of obj) {
      arrCopy.push(deepClone(item))
    }
    return arrCopy as any
  }

  // 处理对象
  const clonedObj: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as any)[key])
    }
  }

  return clonedObj as T
}

export { deepClone }
