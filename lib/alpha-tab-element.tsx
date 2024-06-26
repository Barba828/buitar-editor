import { FC, HTMLProps, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlphaTabApi, LayoutMode, synth, model } from '@coderline/alphatab'
import type { Settings, RenderingResources } from '@coderline/alphatab'
import { ReactEditor, RenderElementProps, useSelected, useSlateStatic } from 'slate-react'
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

export const AlphaTabElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = memo(
  ({ attributes, element, children, ...divProps }) => {
    const { link: elementLink = '', extend = false } = element as GTPPreviewerElement
    const editor = useSlateStatic()
    const selected = useSelected()
    const containerRef = useRef<HTMLDivElement>(null)
    const elementRef = useRef<HTMLDivElement>(null)
    const toolRef = useRef<HTMLDivElement>(null)
    const [fullscreen, setFullscreen] = useState(false)
    const [showTracks, setShowTracks] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [link, setLink] = useState(typeof elementLink === 'string' ? elementLink : '')
    const isLightMode = useIsLightMode()

    const [alphaTabApi, setAlphaTabApi] = useState<AlphaTabApi>()
    const [alphaTabError, setAlphaTabError] = useState<Error>()
    const [score, setScore] = useState<AlphaTabApi['score']>()
    const [tracks, setTracks] = useState<AlphaTabApi['tracks']>([])
    const [renderTracks, setRenderTracks] = useState<AlphaTabApi['tracks']>([])
    const [ready, setReady] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [currentSecond, setCurrentSecond] = useState(0)
    const [endSecond, setEndSecond] = useState(Infinity)

    /** 初始化 */
    useEffect(() => {
      const api = new AlphaTabApi(elementRef.current!, {
        core: {
          // file: elementLink,
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
          scale: 0.5,
        },
      } as Settings)

      api.scoreLoaded.on((score) => {
        console.log('scoreLoaded', score, api)
        setScore(score)
        setTracks(score.tracks)
      })

      api.renderStarted.on(() => {
        setRenderTracks(api.tracks)
      })

      api.playerReady.on(() => {
        setAlphaTabError(undefined)
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

      api.error.on((e) => {
        setAlphaTabError(e)
      })
      setAlphaTabApi(api)
      return () => {
        api?.destroy()
      }
    }, [])
    /** 监听 gtp谱链接 */
    useEffect(() => {
      if (!elementLink || !alphaTabApi) {
        return
      }
      setReady(false)
      alphaTabApi.load(elementLink)
    }, [elementLink, alphaTabApi])
    /** 监听 theme */
    useEffect(() => {
      if (!alphaTabApi) {
        return
      }
      const themeResources = (
        isLightMode
          ? {
            staffLineColor: new model.Color(34, 34, 34), // 六线谱线的颜色
            barSeparatorColor: new model.Color(34, 34, 34), // 小节分隔符颜色
            barNumberColor: new model.Color(100, 108, 255), // 小节号的颜色
            mainGlyphColor: new model.Color(17, 17, 17), // 主要音符的颜色
            secondaryGlyphColor: new model.Color(24, 24, 24), // 次要音符的颜色
            scoreInfoColor: new model.Color(8, 8, 8), // 歌曲信息的颜色
          }
          : {
            staffLineColor: new model.Color(221, 221, 221), // 六线谱线的颜色
            barSeparatorColor: new model.Color(221, 221, 221), // 小节分隔符颜色
            barNumberColor: new model.Color(100, 108, 255), // 小节号的颜色
            mainGlyphColor: new model.Color(238, 238, 238), // 主要音符的颜色
            secondaryGlyphColor: new model.Color(232, 232, 232), // 次要音符的颜色
            scoreInfoColor: new model.Color(248, 248, 248), // 歌曲信息的颜色
          }
      ) as RenderingResources
      alphaTabApi.settings.display.resources = {
        ...alphaTabApi.settings.display.resources,
        ...themeResources,
      }
      alphaTabApi.updateSettings()
      alphaTabApi.render()
    }, [isLightMode, alphaTabApi])

    const playPause = () => {
      alphaTabApi?.playPause()
    }
    const playStop = () => {
      alphaTabApi?.stop()
    }

    const print = () => {
      alphaTabApi?.print()
    }

    const changeZoomIn = (item: SelectorItem<string>) => {
      if (!alphaTabApi) {
        return
      }
      const zoomLevel = parseInt(item.value) / 100
      alphaTabApi.settings.display.scale = zoomLevel
      alphaTabApi.updateSettings()
      alphaTabApi.render()
    }

    const changeLayout = (item: SelectorItem<LayoutMode>) => {
      if (!alphaTabApi) {
        return
      }

      alphaTabApi.settings.display.layoutMode = item.value
      alphaTabApi.updateSettings()
      alphaTabApi.render()
    }

    const changeElementLink = useCallback(
      (targetLink?: string) => {
        Transforms.setNodes(
          editor,
          { link: targetLink },
          { at: ReactEditor.findPath(editor, element) }
        )
      },
      [editor, element]
    )

    const changeElementExtend = useCallback(() => {
      Transforms.setNodes(
        editor,
        { extend: !extend },
        { at: ReactEditor.findPath(editor, element) }
      )
    }, [editor, element, extend])

    const changeFullsceen = useCallback(() => {
      if (!alphaTabApi) {
        return
      }
      alphaTabApi.settings.display.scale = fullscreen ? 0.5 : 1
      alphaTabApi.updateSettings()
      alphaTabApi.render()
      setFullscreen(!fullscreen)
    }, [alphaTabApi, fullscreen])

    const handleRemove = useCallback(() => {
      Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element])

    const handleloadFile: React.ChangeEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        const file = e.target.files?.[0]
        if (file) {
          // setLink(URL.createObjectURL(file))
          const reader = new FileReader()
          reader.onload = (e) => {
            const arrayBuffer = e.target?.result as string
            changeElementLink(arrayBuffer)
            setShowModal(false)
          }
          reader.readAsArrayBuffer(file)
        }
      },
      [changeElementLink]
    )

    const btns = useMemo(
      () =>
        [
          ready && { icon: 'icon-print', onClick: print },
          { icon: 'icon-paperclip-attechment', onClick: () => setShowModal(!showModal) },
          ready && {
            icon: fullscreen ? 'icon-shrink' : 'icon-expand',
            onClick: changeFullsceen,
          },
          !fullscreen && { icon: 'icon-remove', onClick: handleRemove },
        ].filter((it) => !!it),
      [changeFullsceen, fullscreen, handleRemove, print, ready, showModal]
    )

    const footerBtns = useMemo(
      () =>
        [
          ready &&
            !fullscreen && {
            icon: 'icon-trigger',
            onClick: changeElementExtend,
            className: extend ? 'rotate-180' : '',
          },
        ].filter((it) => !!it),
      [changeElementExtend, extend, fullscreen, ready]
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
            onClick={() => alphaTabApi?.renderTracks([track])}
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
                    alphaTabApi?.changeTrackMute([track], track.playbackInfo.isMute)
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
                    alphaTabApi?.changeTrackSolo([track], track.playbackInfo.isSolo)
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
                alphaTabApi?.changeTrackVolume([track], track.playbackInfo.volume)
                setTracks(tracks)
              }}
            ></input>
          </div>
        ))}
      </Popover>
    )

    const linkInputView = (
      <Modal
        visible={showModal}
        onVisibleChange={(value) => setShowModal(value)}
        onOk={() => changeElementLink(link)}
        header="Change GTP file url"
      >
        <input
          contentEditable={true}
          placeholder="Input GTP file url"
          onChange={(e) => setLink(e.target.value)}
          value={link}
          autoFocus
          spellCheck={false}
          className="primary-text-input"
        ></input>
        <label htmlFor="fileInput" className="primary-file-input">
          <Icon name="icon-paperclip-attechment"></Icon>
          <div className="text-sm ml-2"> Upload local GTP file</div>
          <input
            type="file"
            id="fileInput"
            onChange={handleloadFile}
            accept=".gp,.gp3,.gp4,.gp5,.gpx"
          />
        </label>
      </Modal>
    )

    const toolsView = (
      <div className="alpha-tab-element__tools z-10" ref={toolRef}>
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
        <div className="whitespace-nowrap">
          <span className="font-bold">{score?.title}</span>
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
      <>
        <ButtonGroup
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          btns={btns}
        >
          {linkInputView}
        </ButtonGroup>
        <ButtonGroup
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
          btns={footerBtns}
        ></ButtonGroup>
      </>
    )

    const emptyView =
      !elementLink || alphaTabError ? (
        <div
          onClick={() => setShowModal(true)}
          className="h-10 flex items-center justify-start pl-2 py-1 cursor-pointer"
        >
          <Icon name="icon-paperclip-attechment" className="opacity-50 text-xl mr-2"></Icon>
          <div className="font-bold opacity-50 text-sm">
            {alphaTabError ? 'GTP load error, please try again' : 'Add an GTP file'}
          </div>
        </div>
      ) : (
        !ready && (
          <div className="p-4">
            <Skeleton line={4} />
          </div>
        )
      )

    return (
      <div
        {...attributes}
        {...divProps}
        contentEditable={false}
      >
        <div className='invisible'>{children}</div>

        <div
          className={cx(
            'alpha-tab-element group text-sm rounded-lg w-full box-border select-none',
            { 'my-4 relative': !fullscreen },
            {
              'alpha-tab-element--fullscreen fixed m-0 p-0 rounded-none top-0 left-0 flex flex-col':
                fullscreen,
            },
            {
              'alpha-tab-element--extend': extend,
            },
            { 'select-element after:rounded-lg': selected && !fullscreen }
          )}
        >
          <div ref={containerRef} className="alpha-tab-element__container">
            <div ref={elementRef}></div>
            {fullscreen && toolsView}
          </div>
          {emptyView}
          {btnsView}
        </div>
      </div>
    )
  }
)

export default AlphaTabElement

function formatDuration(seconds: number) {
  const minutes = (seconds / 60) | 0
  seconds = (seconds - minutes * 60) | 0
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}
