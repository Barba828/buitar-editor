import { FC, memo, useEffect, useRef, useState } from 'react'
import { AlphaTabApi, Settings, RenderingResources, synth } from '@coderline/alphatab'
import { RenderElementProps } from 'slate-react'
import type { GTPPreviewerElement } from '~chord'
import { Icon } from '~common'

import cx from 'classnames'

import './alpha-tab-element.scss'

export const AlphaTabElement: FC<RenderElementProps> = memo(({ element }) => {
  const { link = '/canon.gp' } = element as GTPPreviewerElement
  const elementRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(true)

  const [api, setApi] = useState<AlphaTabApi>()
  const [score, setScore] = useState<AlphaTabApi['score']>()
  const [tracks, setTracks] = useState<AlphaTabApi['tracks']>([])
  const [ready, setReady] = useState(false)
  const [positionText, setPositionText] = useState('00:00/00:00')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: link,
        fontDirectory: '/font/',
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/soundfont/sonivox.sf2',
      },
      display: {
        resources: {
          staffLineColor: '#ddd', // 六线谱线的颜色
          barSeparatorColor: '#ddd', // 小节分隔符颜色
          barNumberColor: '#ddd', // 小节号的颜色
          mainGlyphColor: '#ddd', // 主要音符的颜色
          secondaryGlyphColor: '#ddd', // 次要音符的颜色
          scoreInfoColor: '#ddd', // 歌曲信息的颜色
        } as unknown as RenderingResources,
      },
    } as Settings)

    setApi(api)

    api.scoreLoaded.on((score) => {
      console.log('lnz scoreLoaded', score)
      setScore(score)
      setTracks(score.tracks)
    })

    api.playerReady.on(() => {
      setReady(true)
    })

    const previousTime = 0
    api.playerPositionChanged.on((e) => {
      const currentSeconds = (e.currentTime / 1000) | 0
      if (currentSeconds == previousTime) {
        return
      }
      const positionText = formatDuration(e.currentTime) + ' / ' + formatDuration(e.endTime)
      setPositionText(positionText)
    })
    api.playerStateChanged.on((e) => {
      setPlaying(e.state === synth.PlayerState.Playing)
    })

    return () => {
      api.destroy()
    }
  }, [link])

  const playPause = () => {
    api?.playPause()
  }
  const playStop = () => {
    api?.stop()
  }

  const tracksView = (
    <div>
      {tracks.map((track) => (
        <div key={track.index}>{track.name}</div>
      ))}
    </div>
  )

  return (
    <div
      className={cx('alpha-tab-element', { 'alpha-tab-element--fullscreen': fullscreen })}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <div className="alpha-tab-element__content" ref={elementRef} style={{ opacity: 0.1 }}></div>
      <div className="alpha-tab-element__tools">
        <button onClick={playStop}>
          <Icon name="icon-back"></Icon>
        </button>
        <button onClick={playPause} disabled={!ready}>
          <Icon name={playing ? 'icon-pause' : 'icon-play'}></Icon>
        </button>
        <div>
          <span style={{ fontWeight: 'bold' }}>{score?.title}</span>
          <span> - {score?.artist}</span>
        </div>
        <div>{positionText}</div>
        {/* <button>
          <Icon name="icon-back"></Icon>
        </button>
        <button>
          <Icon name="icon-back"></Icon>
        </button>
        <button>
          <Icon name="icon-back"></Icon>
        </button> */}
        {tracksView}
      </div>
    </div>
  )
})

function formatDuration(milliseconds: number) {
  let seconds = milliseconds / 1000
  const minutes = (seconds / 60) | 0
  seconds = (seconds - minutes * 60) | 0
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}
