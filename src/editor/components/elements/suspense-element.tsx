import { FC, Suspense } from 'react'
import type { ReactNode, SuspenseProps } from 'react'
import { Skeleton } from '~common'

import './suspense-element.scss'

export const SuspenseElement: FC<SuspenseProps & { elementChildren: ReactNode }> = ({
  children,
  elementChildren,
}) => {
  return (
    <Suspense
      fallback={
        <div className='suspense-element' contentEditable={false} suppressContentEditableWarning={true}>
          <Skeleton line={2} />
          <div style={{ display: 'none' }}>{elementChildren}</div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
