import { FC, memo, useEffect, useRef, useState } from 'react'
import { AlphaTabApi, LayoutMode, synth } from '@coderline/alphatab'
import type { Settings, RenderingResources } from '@coderline/alphatab'
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react'
import type { GTPPreviewerElement } from '~chord'
import { Icon, Modal, Popover, Selector, SelectorItem } from '~common'
import { Transforms } from 'slate'

import cx from 'classnames'

import './alpha-tab-element.scss'
import './alpha-tab-tablature.scss'

const zoomInList: Array<SelectorItem<string>> = [
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%', selected: true },
  { value: '110', label: '110%' },
  { value: '125', label: '125%' },
  { value: '150', label: '150%' },
  { value: '200', label: '200%' },
]

const layoutModeList: Array<SelectorItem<LayoutMode>> = [
  { value: LayoutMode.Horizontal, label: 'Horizontal' },
  { value: LayoutMode.Page, label: 'Page', selected: true },
]

export const AlphaTabElement: FC<RenderElementProps> = memo(({ element }) => {
  const { link: elementLink = '/canon.gp' } = element as GTPPreviewerElement
  const editor = useSlateStatic()
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const toolRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(true)
  const [showTracks, setShowTracks] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [link, setLink] = useState(elementLink)

  const [api, setApi] = useState<AlphaTabApi>()
  const [score, setScore] = useState<AlphaTabApi['score']>()
  const [tracks, setTracks] = useState<AlphaTabApi['tracks']>([])
  const [renderTracks, setRenderTracks] = useState<AlphaTabApi['tracks']>([])
  const [ready, setReady] = useState(false)
  const [currentSecond, setCurrentSecond] = useState(0)
  const [endSecond, setEndSecond] = useState(Infinity)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: elementLink,
        fontDirectory: '/font/',
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/soundfont/sonivox.sf2',
        scrollElement: containerRef.current! as HTMLElement,
      },
      display: {
        resources: {
          // staffLineColor: '#ddd', // 六线谱线的颜色
          // barSeparatorColor: '#ddd', // 小节分隔符颜色
          // barNumberColor: '#ddd', // 小节号的颜色
          // mainGlyphColor: '#ddd', // 主要音符的颜色
          // secondaryGlyphColor: '#ddd', // 次要音符的颜色
          // scoreInfoColor: '#ddd', // 歌曲信息的颜色
        } as unknown as RenderingResources,
      },
    } as Settings)

    setApi(api)

    api.scoreLoaded.on((score) => {
      console.log('lnz scoreLoaded', score, api)
      setScore(score)
      setTracks(score.tracks)
    })

    api.renderStarted.on(() => {
      setRenderTracks(api.tracks)
    })

    api.playerReady.on(() => {
      setReady(true)
    })

    // api.activeBeatsChanged.on(() => {
    //   console.log('lnz activeBeatsChanged', api);
    // })
    api.settingsUpdated.on(() => {
      console.log('lnz settingsUpdated', api)
    })

    api.playerPositionChanged.on((e) => {
      const tempSecond = (e.currentTime / 1000) | 0
      if (currentSecond === tempSecond) {
        return
      }
      setCurrentSecond(tempSecond)
      setEndSecond((e.endTime / 1000) | 0)
    })

    api.playerStateChanged.on((e) => {
      setPlaying(e.state === synth.PlayerState.Playing)
    })

    return () => {
      api.destroy()
    }
  }, [elementLink])

  const playPause = () => {
    api?.playPause()
  }
  const playStop = () => {
    api?.stop()
  }

  const print = () => {
    api?.print()
  }

  const changeZoomIn = (item: SelectorItem<string>) => {
    if (!api) {
      return
    }
    /**
     * @todo
     * 这里缩放需要和padding一起处理，视觉体验更合适
     */
    const zoomLevel = parseInt(item.value) / 100
    api.settings.display.scale = zoomLevel
    api.updateSettings()
    api.render()
  }

  const changeLayout = (item: SelectorItem<LayoutMode>) => {
    if (!api) {
      return
    }

    api.settings.display.layoutMode = item.value
    api.updateSettings()
    api.render()
  }

  const changePlayingTracks = () => {
    // api?.changeTrackVolume()
  }

  const changeElementLink = () => {
    Transforms.setNodes(editor, { link }, { at: ReactEditor.findPath(editor, element) })
  }

  const tracksView = (
    <Popover
      rect={toolRef.current?.getBoundingClientRect()}
      className={cx('alpha-tab-element__tools__tracks')}
      onClose={() => setShowTracks(false)}
      overlay={true}
    >
      {tracks.map((track) => (
        <div
          key={track.index}
          className={cx(
            'alpha-tab-element__tools__track',
            renderTracks.includes(track) && 'alpha-tab-element__tools__track--active'
          )}
          onClick={() => api?.renderTracks([track])}
        >
          <div className="alpha-tab-element__tools__track-info">
            <div>
              <div>{track.name}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.6 }}>{track.shortName}</div>
            </div>
            <div className="flex-center">
              <button
                onClick={() => {
                  track.playbackInfo.isMute = !track.playbackInfo.isMute
                  api?.changeTrackMute([track], track.playbackInfo.isMute)
                  setTracks(tracks)
                }}
                className={cx({
                  'alpha-tab-element__tools__btn--active': track.playbackInfo.isMute,
                })}
              >
                mute
              </button>
              <button
                onClick={() => {
                  track.playbackInfo.isSolo = !track.playbackInfo.isSolo
                  api?.changeTrackSolo([track], track.playbackInfo.isSolo)
                  setTracks(tracks)
                }}
                className={cx({
                  'alpha-tab-element__tools__btn--active': track.playbackInfo.isSolo,
                })}
              >
                solo
              </button>
            </div>
          </div>
          <input
            type="range"
            className="alpha-tab-element__tools__track-input"
            min={0}
            max={3}
            step={0.01}
            defaultValue={1}
            onChange={(e) => {
              track.playbackInfo.volume = Number(e.target.value)
              api?.changeTrackVolume([track], track.playbackInfo.volume)
              setTracks(tracks)
            }}
          ></input>
        </div>
      ))}
    </Popover>
  )

  const linkInputView = (
    <Modal
      visible={showLink}
      onVisibleChange={(value) => setShowLink(value)}
      onOk={changeElementLink}
      header="Change GTP file url"
    >
      <input
        className="alpha-tab-element__input"
        contentEditable={true}
        placeholder="Input GTP file url"
        onChange={(e) => setLink(e.target.value)}
        value={link}
        autoFocus
      ></input>
    </Modal>
  )

  const toolsView = (
    <div className="alpha-tab-element__tools" ref={toolRef}>
      <div>
        <button onClick={() => setShowTracks(!showTracks)}>
          <Icon name="icon-guitar"></Icon>
        </button>
        <button onClick={playStop}>
          <Icon name="icon-back"></Icon>
        </button>
        <button onClick={playPause} disabled={!ready}>
          <Icon name={playing ? 'icon-pause' : 'icon-play'}></Icon>
        </button>
      </div>
      <div style={{ whiteSpace: 'nowrap' }}>
        <span style={{ fontWeight: 'bold' }}>{score?.title}</span>
        <span> - {score?.artist}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="alpha-tab-element__duration">
          <div
            style={{ width: `${(currentSecond / endSecond) * 100}%` }}
            className="alpha-tab-element__duration--percentage"
          ></div>
        </div>
        <div className="alpha-tab-element__seconds flex-space-between">
          <span>{formatDuration(currentSecond)}</span>
          <span>{formatDuration(endSecond)}</span>
        </div>
      </div>

      <Selector
        className={cx('alpha-tab-element__trigger alpha-tab-element__selector')}
        lists={zoomInList}
        onChange={changeZoomIn}
        defaultValue={'100%'}
      ></Selector>
      <Selector
        className={cx('alpha-tab-element__trigger alpha-tab-element__selector')}
        lists={layoutModeList}
        onChange={changeLayout}
        defaultValue={LayoutMode.Page}
      ></Selector>

      {showTracks && tracksView}
    </div>
  )

  const btnsView = (
    <div className="alpha-tab-element__btns" contentEditable={false}>
      <div className="alpha-tab-element__trigger flex-center" onClick={print}>
        <Icon name="icon-print"></Icon>
      </div>
      <div
        className="alpha-tab-element__trigger flex-center"
        onClick={() => setShowLink(!showLink)}
      >
        <Icon name="icon-edit-pencil"></Icon>
      </div>
      <div
        className="alpha-tab-element__trigger flex-center"
        onClick={() => setFullscreen(!fullscreen)}
      >
        <Icon name={fullscreen ? 'icon-shrink' : 'icon-expand'}></Icon>
      </div>
      {linkInputView}
    </div>
  )

  return (
    <div
      className={cx('alpha-tab-element', { 'alpha-tab-element--fullscreen': fullscreen })}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <div ref={containerRef} className="alpha-tab-element__container">
        <div ref={elementRef}></div>
      </div>
      {fullscreen && toolsView}
      {btnsView}
    </div>
  )
})

function formatDuration(seconds: number) {
  const minutes = (seconds / 60) | 0
  seconds = (seconds - minutes * 60) | 0
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}
