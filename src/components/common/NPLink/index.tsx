'use client'
import NextLink from 'next/link'
import { forwardRef } from 'react'
import NProgress from 'nprogress'
import { shouldTriggerStartEvent } from './shouldTriggerStartEvent'

const NPLink = (props: any, ref: any) => {
  const { href, onClick, sx = {}, ...rest } = props
  const useLink = href && href.startsWith('/')

  if (!useLink) return <a href={href} onClick={onClick} {...rest} />

  const handleClickLink = (event: any) => {
    if (shouldTriggerStartEvent(href, event)) {
      NProgress?.start?.()
    }
    if (onClick) onClick(event)
  }

  return (
    <NextLink
      href={href}
      onClick={(event) => {
        handleClickLink(event)
      }}
      {...rest}
      ref={ref}
      style={{
        lineHeight: '0px',
        ...sx,
      }}
    />
  )
}

export default forwardRef(NPLink)
