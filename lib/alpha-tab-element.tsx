import {
  FC,
  HTMLProps,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AlphaTabApi, LayoutMode, synth } from '@coderline/alphatab'
import type { Settings, RenderingResources } from '@coderline/alphatab'
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react'
import type { GTPPreviewerElement } from '~chord'
import {
  ButtonGroup,
  Icon,
  Modal,
  Popover,
  Selector,
  SelectorItem,
  Skeleton,
  useIsLightMode,
} from '~common'
import { Transforms } from 'slate'
import { baseUrl } from '../src/meta'
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

export const AlphaTabElement: FC<
  RenderElementProps & HTMLProps<HTMLDivElement> & { placeholder?: ReactNode }
> = memo(({ attributes, element, children, placeholder, ...divProps }) => {
  const { link: elementLink = '' } = element as GTPPreviewerElement
  const editor = useSlateStatic()
  const selected = useSelected()
  const focused = useFocused()
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const toolRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [showTracks, setShowTracks] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [link, setLink] = useState(elementLink)
  const isLightMode = useIsLightMode()

  const [api, setApi] = useState<AlphaTabApi>()
  const [score, setScore] = useState<AlphaTabApi['score']>()
  const [tracks, setTracks] = useState<AlphaTabApi['tracks']>([])
  const [renderTracks, setRenderTracks] = useState<AlphaTabApi['tracks']>([])
  const [ready, setReady] = useState(false)
  const [currentSecond, setCurrentSecond] = useState(0)
  const [endSecond, setEndSecond] = useState(Infinity)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const themeResources = (isLightMode
      ? {
        staffLineColor: '#222', // 六线谱线的颜色
        barSeparatorColor: '#222', // 小节分隔符颜色
        barNumberColor: '#646cff', // 小节号的颜色
        mainGlyphColor: '#111', // 主要音符的颜色
        secondaryGlyphColor: '#181818', // 次要音符的颜色
        scoreInfoColor: '#080808', // 歌曲信息的颜色
      }
      : {
        staffLineColor: '#ddd', // 六线谱线的颜色
        barSeparatorColor: '#ddd', // 小节分隔符颜色
        barNumberColor: '#646cff', // 小节号的颜色
        mainGlyphColor: '#eee', // 主要音符的颜色
        secondaryGlyphColor: '#e8e8e8', // 次要音符的颜色
        scoreInfoColor: '#f8f8f8', // 歌曲信息的颜色
      }) as unknown as RenderingResources

    const api = new AlphaTabApi(elementRef.current!, {
      core: {
        file: elementLink,
        fontDirectory: `${baseUrl}font/`,
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: `${baseUrl}soundfont/sonivox.sf2`,
        scrollElement: containerRef.current! as HTMLElement,
      },
      display: {
        resources: themeResources,
        scale: 0.5,
      },
    } as Settings)

    setApi(api)

    api.scoreLoaded.on((score) => {
      console.log('scoreLoaded', score, api)
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
    // })
    // api.settingsUpdated.on(() => {
    // })

    let prevCurrentSecond = 0
    api.playerPositionChanged.on((e) => {
      const tempSecond = (e.currentTime / 1000) | 0
      if (prevCurrentSecond === tempSecond) {
        return
      }
      prevCurrentSecond = tempSecond
      setCurrentSecond(tempSecond)
      setEndSecond((e.endTime / 1000) | 0)
    })

    api.playerStateChanged.on((e) => {
      setPlaying(e.state === synth.PlayerState.Playing)
    })

    return () => {
      api.destroy()
    }
  }, [elementLink, isLightMode])

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

  const changeElementLink = () => {
    Transforms.setNodes(editor, { link }, { at: ReactEditor.findPath(editor, element) })
  }

  const changeFullsceen = useCallback(() => {
    if (!api) {
      return
    }
    api.settings.display.scale = fullscreen ? 0.5 : 1
    api.updateSettings()
    api.render()
    setFullscreen(!fullscreen)
  }, [api, fullscreen])

  const handleRemove = useCallback(() => {
    Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
  }, [editor, element])

  const btns = useMemo(
    () =>
      [
        { icon: 'icon-print', onClick: print },
        { icon: 'icon-paperclip-attechment', onClick: () => setShowLink(!showLink) },
        { icon: fullscreen ? 'icon-shrink' : 'icon-expand', onClick: changeFullsceen },
        !fullscreen && { icon: 'icon-close', onClick: handleRemove },
      ].filter((it) => !!it),
    [changeFullsceen, fullscreen, handleRemove, print, showLink]
  )

  const tracksView = (
    <Popover
      rect={toolRef.current?.getBoundingClientRect()}
      className={cx('alpha-tab-element__tools__tracks')}
      onClose={() => setShowTracks(false)}
      overlay={true}
      option={{ offset: 0 }}
    >
      {tracks.map((track) => (
        <div
          key={track.index}
          className={cx(
            'alpha-tab-element__tools__track',
            renderTracks.includes(track) && 'alpha-tab-element__tools__track--active'
          )}
          style={{ borderColor: track.color.rgba }}
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
        spellCheck={false}
      ></input>
    </Modal>
  )

  const toolsView = (
    <div className="alpha-tab-element__tools" ref={toolRef}>
      <div className="flex-center">
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
    <ButtonGroup className="alpha-tab-element__btns" btns={btns}>
      {linkInputView}
    </ButtonGroup>
  )

  const emptyView = !elementLink ? (
    <div className="alpha-tab-element__empty flex-center" onClick={() => setShowLink(!showLink)}>
      <Icon name="icon-paperclip-attechment"></Icon>
      {placeholder || 'Click to load GTP file'}
    </div>
  ) : (
    !ready && <Skeleton line={4} />
  )

  return (
    <div
      {...attributes}
      {...divProps}
      className={cx(
        'alpha-tab-element',
        { 'alpha-tab-element--fullscreen': fullscreen },
        { 'alpha-tab-element--active': selected && !focused },
        divProps.className
      )}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <div style={{ display: 'none' }}>{children}</div>
      <div ref={containerRef} className="alpha-tab-element__container">
        <div ref={elementRef}></div>
      </div>
      {emptyView}
      {fullscreen && toolsView}
      {btnsView}
    </div>
  )
})

export default AlphaTabElement

function formatDuration(seconds: number) {
  const minutes = (seconds / 60) | 0
  seconds = (seconds - minutes * 60) | 0
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}
