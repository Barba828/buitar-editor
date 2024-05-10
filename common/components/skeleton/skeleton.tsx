import { memo } from 'react'
import './skeleton.scss'

/**
 * Skeleton 生成 30% ~ 100% 的随机宽度
 */
export const Skeleton = memo(({ line }: { line: number }) => {
  return (
    <div className="skeleton-wrapper">
      {new Array(line).fill(0).map((_, index) => (
        <div key={index} className="skeleton-line" style={{width:`${Math.floor(Math.random() * 71) + 30}%`}}></div>
      ))}
    </div>
  )
})
