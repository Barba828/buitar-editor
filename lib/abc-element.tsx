/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, HTMLProps, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Transforms } from 'slate'
import { ReactEditor, RenderElementProps, useSelected, useSlateStatic } from 'slate-react'
import { type ABCTablatureElement } from '~chord'
import {
  TablatureInstrument,
  renderAbc,
  synth,
  TuneBook,
  TuneObject,
  SynthObjectController,
  MidiBuffer,
} from 'abcjs'
import { ButtonGroup, Icon, Selector, type SelectorItem, toast } from '~common'
import cx from 'classnames'

import './abc-element.scss'
import './abcjs-audio.css'

const renderInstruments: Array<SelectorItem<TablatureInstrument>> = [
  { value: '', label: '--' },
  { value: 'guitar', label: 'guitar' },
  { value: 'violin', label: 'violin' },
]

const playInstruments: Array<SelectorItem<number>> = [
  { value: 0, label: 'Acoustic Piano' },
  { value: 4, label: 'Electric Piano' },
  { value: 6, label: 'Harpsichord' },
  { value: 7, label: 'Clavi' },
  { value: 8, label: 'Celesta' },
  { value: 23, label: 'Tango Accordion' },
  { value: 24, label: 'Acoustic Guitar (nylon)' },
  { value: 25, label: 'Acoustic Guitar (steel)' },
  { value: 26, label: 'Electric Guitar (jazz)' },
  { value: 56, label: 'Trumpet' },
  { value: 57, label: 'Trombone' },
  { value: 58, label: 'Tuba' },
  { value: 59, label: 'Muted Trumpet' },
  { value: 60, label: 'French Horn' },
]

export const ABCElement: FC<RenderElementProps & HTMLProps<HTMLDivElement>> = memo(
  ({ attributes, element, children, ...divProps }) => {
    const editor = useSlateStatic()
    const selected = useSelected()
    const { instrument, data: originText, extend = false } = element as ABCTablatureElement
    const [fullscreen, setFullscreen] = useState(false)
    const [editable, setEditable] = useState(false)
    //     const [text, setText] = useState(
    //       `%%gchordfont "itim-music,Itim" 20
    // X: 1
    // T:Money Lost
    // M:3/4
    // L:1/8
    // Q:1/4=100
    // C:Paul Rosen
    // S:Copyright 2007, Paul Rosen
    // R:Klezmer
    // K:Dm
    // Ade|:"Dm"(f2d)e gf|"A7"e2^c4|"Gm"B>>^c BA BG|"A"A3Ade|"Dm"(f2d)e gf|"A7"e2^c4|
    // "Gm"A>>B "A7"AG FE|1"Dm"D3Ade:|2"Dm"D3DEF||:"Gm"(G2D)E FG|"Dm"A2F4|"Gm"B>>c "A7"BA BG|
    // "Dm"A3 DEF|"Gm"(G2D)EFG|"Dm"A2F4|"E°"E>>Fy "(A7)"ED^C2|1"Dm"D3DEF:|2"Dm"D6||

    // X: 32
    // T:Pretty Little Liza
    // C:Paul Rosen
    // S:Copyright 2005, Paul Rosen
    // M:4/4
    // L:1/8
    // Q:1/2=106
    // R:old time
    // K:Am
    // "Am"A2AA c2dd|e2eg e2dc|A2AA c2dd|e2cc A2cc|"Em (G)"B2BB B2BB|
    // B2BB B2BB|"Am"A2AA c2dd|e2eg e2c2|"D"d2dd d2dd|d2dd d2cd|
    // "Am"e2cc A2c2|"G"BAG2 BAG2|"Am"A2AA A2AA|A2AA A2AA|:"Am"e4 a3e|"G"g2d2- d2eg|
    // "Am"a2aa ged2|"Em"e2ee e2ee|"Am"e4 a3e|"G"g2d2- d2Bc|"Em"d2e2 dcB2|"Am"A2AA A2AA:|

    // X:49
    // M:4/4
    // L:1/16
    // %%stretchlast .7
    // Q:1/4=100
    // T:Piano
    // %%staves {(PianoRightHand) (PianoLeftHand)}
    // V:PianoRightHand clef=treble
    // V:PianoLeftHand clef=bass
    // K:C
    // [V: PianoRightHand] !mp!e2f2 e2d2 c2B2 A4|!>(!B2d2 g4 c6 !>)!e2|!p![G4e4] z4 A4 G4|c12 z4|[A12f12] [g4d4]|z4 !<(!B4 !<)![A8c8]|
    // !mf!A4 z4 d8|B8 [G4c4] z4|f2A2 c4 f4 g4|[f12d12] e4|!<(!A4 A4 c2e2 !<)!g4|!f!e8 z8|
    // [A4d4] z4 A8|BcBA G4 c4 G2B2|A2G2 A2B2 c4 B2G2|c12 z4|]
    // [V: PianoLeftHand] [E,12C,12] F,4|[G,8D,8] [C,8E,8]|G,4 C,4 C,4 B,,A,,C,B,,|A,,12 z4|A,,4 B,,4 C,2D,2 B,,C,D,E,|C,2E,2 G,4 E,2F,2 G,4|
    // F,4 A,4 [A,8F,8]|G,2F,2 E,2D,2 [C,4E,4] z4|[F,8A,8] [D,4A,4] z4|F,2G,2 A,2F,2 D,2F,2 C,2B,,2|C,4 F,A,D,F, E,4 z4|C,8 z8|
    // F,4 E,4 F,4 A,4|[D,8G,8] E,4 z4|C,4 [C,4F,4] z4 G,4|C,12 z4|]

    // X:77
    // T:Mary
    // M:C
    // L:1/4
    // K:G
    // BAGA| BBB2|AAA2| Bdd2|
    // w:Mar- y had a lit- tle lamb, lit- tle lamb, lit- tle lamb,
    // BAGA| BBBB|AABA |G|]
    // w:Mar- y had a lit- tle lamb whose fleece was white as snow.

    // X:102
    // %%staves 1 2 3
    // T: Sonata I
    // C: J.S. Bach
    // M: C
    // Q:"Adagio"
    // L: 1/8
    // K:C
    // V:1 clef=treble name="Violino I"      sname="Vl. I"
    // V:2 clef=treble name="Violino II"     sname="Vl. II"  space=+10
    // V:3 clef=bass   name="Violoncello" sname="Vc."
    // [V:1]  g8-|gf/e/ {e}f>g (a/f/d/f/) (A//=B//A//B//TB3//A///B///)|
    // [V:2] z8 | z8 |
    // [V:3] z cec gGBG | Aa- a/_b/a/g/ f3 g/f/ |
    // %
    // [V:1] c/gf/ E/ed/ c/c'b/ A/ag/ | ^f/e/d- d/(c/B/A/) G/(e/c/e/) Aa| d2-d/g/_b/a/ a3 g/=f/|
    // [V:2] c8- | cB/A/ {A}B>c (e/c/A/c/) (E//^F//E//F//TF3//E///F///) | G/(D/G/A/) _B/G/g/e/ ^cA d2-|
    // [V:3] edcB AG^FE | D^FGg c3d/c/| _BG g2-gf/e/ f>g|

    // X:232
    // T:Amazing Grace
    // C:Lyric Author: John Newton
    // R:Early American Melody
    // Z:Public Domain
    // N:A well known tune
    // L:1/4
    // M:3/4
    // %%staves (S A) (T B)
    // V:S clef=treble name=""
    // V:A clef=treble name=""
    // V:T clef=bass name=""
    // V:B clef=bass name=""
    // K:Ab
    // % Measures 1 - 7
    // [V:S] (E/ F/) | A2 (c/ A/) | c2 B | A2 F |  E2 (E/ F/) | A2 (c/ A/) | c2 (B/ c/) | He2 |
    // [V:A] (C/ D/) | C2 (E/ C/) | E2 D | C2 D | C2 (C/ D/) | C2 (E/ C/) | E2 A | G2 |
    // [V:T] A, | E,2 A, | A,2 G, | A,2 A, | A,2 A, | E,2 A, | A,2 A, | HB,2 |
    // [V:B] A,, | A,,2 A,, | A,,2 E, | F,2 D, | A,,2 A,, | A,,2 A,, | A,2 F, | E,2 |
    // % Measures 8 - 14
    // [V:S] (B/ c/) | e2 (e/ c/)  | A2 (F/ E/) |  A2 F | E2 (E/ F/) | A2 (c/ A/) | c2 B | HA2 |
    // [V:A] G | A2 (A/ E/) | E2 (D/ C/) | F2 D | C2 (C/ D/) | C2 (E/ A/) | G2 G | E2 |
    // [V:T] E | C2 (C/ A,/) | C2 A, | A,2 A, | A,2 A, | A,2 (A,/ C/) | E2 D | HC2 |
    // [V:B] E, | A,2 A, | A,2 A, | D,2 D, | A,,2 A, | F,2 E, | E,2 E, | A,,2 |

    // X:400
    // T:Drum Kit
    // %%map drummap D    print=D heads=x_head   % pedal hi-hat
    // %%map drummap E    print=E                % bass drum 1
    // %%map drummap F    print=F                % acoustic bass drum
    // %%map drummap G    print=G                % low floor tom-tom
    // %%map drummap A    print=A                % high floor tom-tom
    // %%map drummap B    print=B                % low tom-tom
    // %%map drummap ^B   print=B heads=triangle % tambourine
    // %%map drummap c    print=c                % acoustic snare
    // %%map drummap _c   print=c                % electric snare
    // %%map drummap ^c   print=c heads=triangle % low wood block
    // %%map drummap =c   print=c                % side stick
    // %%map drummap d    print=d                % low-mid tom tom
    // %%map drummap ^d   print=d heads=triangle % high wood block
    // %%map drummap e    print=e                % high-mid tom tom
    // %%map drummap ^e   print=e heads=triangle % cowbell
    // %%map drummap f    print=f                % high tom tom
    // %%map drummap ^f   print=f heads=x_head   % ride cymbal 1
    // %%map drummap g    print=g heads=x_head   % closed hi-hat
    // %%map drummap ^g   print=g heads=diamond  % open hi-hat
    // %%map drummap a    print=a heads=x_head   % crash cymbal 1
    // %%map drummap ^a   print=a heads=triangle % open triangle
    // %%MIDI drummap D   44 % pedal hi-hat
    // %%MIDI drummap E   36 % bass drum 1
    // %%MIDI drummap F   35 % acoustic bass drum
    // %%MIDI drummap G   41 % low floor tom-tom
    // %%MIDI drummap A   43 % high floor tom-tom
    // %%MIDI drummap B   45 % low tom-tom
    // %%MIDI drummap ^B  54 % tambourine
    // %%MIDI drummap c   38 % acoustic snare
    // %%MIDI drummap _c  40 % electric snare
    // %%MIDI drummap ^c  77 % low wood block
    // %%MIDI drummap =c  37 % side stick
    // %%MIDI drummap d   47 % low-mid tom tom
    // %%MIDI drummap ^d  76 % high wood block
    // %%MIDI drummap e   48 % high-mid tom tom
    // %%MIDI drummap ^e  56 % cowbell
    // %%MIDI drummap f   50 % high tom tom
    // %%MIDI drummap ^f  51 % ride cymbal 1
    // %%MIDI drummap g   42 % closed hi-hat
    // %%MIDI drummap ^g  46 % open hi-hat
    // %%MIDI drummap a   49 % crash cymbal 1
    // %%MIDI drummap ^a  81 % open triangle
    // %%score (1 2)
    // Q:1/4=120
    // M:4/4
    // L:1/4
    // K:C perc
    // V:1
    // z4| g/^f/g/^f/ g/^f/g/^f/| c/^f/g/^f/ A/^f/g/^f/| c/^f/g/^f/ A/^f/g/^f/|
    // c/c/g/^f/ A/A/g/^f/| c/^f/c/^f/ A/^f/A/^f/|(3B/B/B/ (3f/f/f/ (3e/e/e/ (3d/d/d/ | a4|
    // V:2
    // E D E/E/ D|E D E/E/ D|E D E/E/ D|E D E/E/ D|
    // E D E/E/ D|E D E/E/ D|E D E/E/ D|E D E/E/ D|
    // `
    //     )
    // const [text, setText] = useState(
    //   "T: Cooley's\n" +
    //     'M: 4/4\n' +
    //     'Q: 1/4=120\n' +
    //     'L: 1/8\n' +
    //     'R: reel\n' +
    //     'K: Emin\n' +
    //     '%%MIDI program 1\n' +
    //     '|:{E}D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|\n' +
    //     'EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|\n' +
    //     '|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|\n' +
    //     'eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|'
    // )
    const [text, setText] = useState(originText || '')

    const musicSheetRef = useRef<HTMLDivElement>(null)
    const musicToolsRef = useRef<HTMLDivElement>(null)
    const musicCursorRef = useRef<SVGLineElement>(null)
    const visualObj = useRef<TuneObject>()
    const synthControl = useRef<SynthObjectController>()
    const midiBuffer = useRef<MidiBuffer>()
    const [ready, setReady] = useState(false) // midi素材状态
    const [playing, setPlaying] = useState(false) // 播放状态
    const [currentSecond, setCurrentSecond] = useState(0) // 当前播放时间
    const [endSecond, setEndSecond] = useState(Infinity) // 播放结束时间
    const [transpose, setTranspose] = useState<number>(0) // 升降key

    useEffect(() => {
      if (!musicSheetRef.current) {
        return
      }
      const tablature = instrument ? [{ instrument }] : []

      visualObj.current = renderAbc(musicSheetRef.current, text, {
        add_classes: true,
        // oneSvgPerLine: true,
        responsive: 'resize',
        selectTypes: false,
        tablature: tablature,
        visualTranspose: transpose,
      })[0]
    }, [text, instrument, transpose])

    useEffect(() => {
      if (!fullscreen || !musicToolsRef.current || !visualObj.current || !synth.supportsAudio()) {
        return
      }

      synthControl.current = new synth.SynthController()
      synthControl.current.load(
        musicToolsRef.current,
        {
          onStart: () => {
            setPlaying(true)
          },
          onReady: () => {
            setReady(true)
            // @ts-ignore
            musicCursorRef.current = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            musicCursorRef.current.setAttribute('class', 'abcjs-cursor')
            musicCursorRef.current.setAttributeNS(null, 'x1', '0')
            musicCursorRef.current.setAttributeNS(null, 'y1', '0')
            musicCursorRef.current.setAttributeNS(null, 'x2', '0')
            musicCursorRef.current.setAttributeNS(null, 'y2', '0')
            const svg = musicSheetRef.current?.querySelector('svg')
            svg?.appendChild(musicCursorRef.current)
          },
          onBeat: (_beatNumber, _totalBeats, totalTime) => {
            setEndSecond(totalTime)
          },
          onEvent: (ev) => {
            if (ev.measureStart && ev.left === null) return // this was the second part of a tie across a measure line. Just ignore it.

            setCurrentSecond(ev.milliseconds)
            const lastSelection = musicSheetRef.current?.querySelectorAll('svg .highlight')
            if (lastSelection) {
              for (let k = 0; k < lastSelection.length; k++) {
                lastSelection[k].classList.remove('highlight')
              }
            }

            for (let i = 0; i < (ev?.elements?.length || 0); i++) {
              const note = ev.elements?.[i]
              if (note) {
                for (let j = 0; j < note.length; j++) {
                  note[j].classList.add('highlight')
                }
              }
            }

            if (musicCursorRef.current && ev.left && ev.top) {
              musicCursorRef.current.setAttribute('x1', String(ev.left - 2))
              musicCursorRef.current.setAttribute('x2', String(ev.left - 2))
              musicCursorRef.current.setAttribute('y1', String(ev.top))
              musicCursorRef.current.setAttribute('y2', String(ev.top + (ev?.height || 0)))
            }
          },
          onFinished: () => {
            setPlaying(false)
          },
        },
        {
          displayLoop: false,
          displayRestart: false,
          displayPlay: false,
          displayProgress: false,
          displayWarp: false,
        }
      )
      const midi = new synth.CreateSynth()

      midi
        .init({
          visualObj: visualObj.current,
          options: {},
        })
        .then(() => {
          synthControl.current?.setTune(visualObj.current!, true)
          midiBuffer.current = midi
        })
    }, [fullscreen])

    const title = useMemo(() => {
      const tunebook = new TuneBook(text)
      return tunebook?.tunes[0]?.title || Date.now()
    }, [text])

    const handleTogglePlay = useCallback(() => {
      synthControl.current?.play()
      setPlaying(!playing)
    }, [playing])
    const handleRestart = () => {
      synthControl.current?.restart()
    }

    const handleRenderIntrumentChange = useCallback(
      (item: SelectorItem<TablatureInstrument>) => {
        const nextInstrument = item.value
        Transforms.setNodes(
          editor,
          { instrument: nextInstrument },
          { at: ReactEditor.findPath(editor, element) }
        )
      },
      [editor, element]
    )

    const handlePlayIntrumentChange = useCallback(
      (item: SelectorItem<number>) => {
        synthControl.current?.pause()

        // 更新 program abcString
        const abcLines = text.split('\n')
        const midiLineIndex = abcLines.findIndex((line) => line.startsWith('%%MIDI program'))
        if (midiLineIndex !== -1) {
          abcLines[midiLineIndex] = `%%MIDI program ${item.value}`
        }
        setText(abcLines.join('\n'))

        // 更新midi
        synthControl.current?.setTune(visualObj.current!, true, {
          program: item.value,
        })
      },
      [text]
    )

    const changeElementExtend = useCallback(() => {
      Transforms.setNodes(
        editor,
        { extend: !extend },
        { at: ReactEditor.findPath(editor, element) }
      )
    }, [editor, element, extend])

    const handlePrint = useCallback(() => {
      // window.print()
      const printWindow = window.open('', '_blank')
      if (!printWindow || !musicSheetRef.current) {
        return
      }
      printWindow.document.write(
        `<html><head><title> buitar editor </title></head><body>
        ${musicSheetRef.current.innerHTML}
      </body></html>`
      )
      printWindow.document.close()
      printWindow.print()
    }, [])

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(text).then(() => {
        toast('Cupied Text')
      })
    }, [text])

    const handleRemove = useCallback(() => {
      Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })
    }, [editor, element])

    const handleDownloadWav = useCallback(() => {
      synthControl.current?.download(`${title}.wav`)
    }, [title])

    const handleDownloadMidi = useCallback(() => {
      const midi = synth.getMidiFile(text, { midiOutputType: 'encoded' })?.[0]
      const element = document.createElement('a')
      element.setAttribute('href', midi)
      element.setAttribute('download', `${title}.midi`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }, [text, title])

    const handleEdit = useCallback(() => {
      if (editable) {
        Transforms.setNodes(editor, { data: text }, { at: ReactEditor.findPath(editor, element) })
      }
      setEditable(!editable)
    }, [editable, editor, element, text])

    const mainBtns = useMemo(
      () =>
        [
          { icon: 'icon-copy', onClick: handleCopy },
          { icon: 'icon-print', onClick: handlePrint },
          { icon: 'icon-download', onClick: handleDownloadMidi },
          {
            icon: !editable ? 'icon-edit-pencil' : 'icon-done',
            onClick: handleEdit,
          },
          {
            icon: fullscreen ? 'icon-shrink' : 'icon-expand',
            onClick: () => setFullscreen(!fullscreen),
          },
          !fullscreen && { icon: 'icon-remove', onClick: handleRemove },
        ].filter((it) => !!it),
      [editable, fullscreen, handleCopy, handleDownloadMidi, handleEdit, handlePrint, handleRemove]
    )

    const footerBtns = useMemo(
      () =>
        [
          !fullscreen && {
            icon: 'icon-trigger',
            onClick: changeElementExtend,
            className: extend ? 'rotate-180' : '',
          },
        ].filter((it) => !!it),
      [changeElementExtend, extend, fullscreen]
    )

    const leftBtns = useMemo(
      () => [
        {
          icon: (
            <Selector
              className={cx(
                'abc-editor__trigger bg-transparent',
                !instrument && 'abc-editor__trigger--no-instrument'
              )}
              defaultValue={instrument}
              lists={renderInstruments}
              onChange={handleRenderIntrumentChange}
            ></Selector>
          ),
        },
      ],
      [handleRenderIntrumentChange, instrument]
    )

    const btnsView = (
      <>
        <ButtonGroup
          className="abc-editor__btns absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          btns={mainBtns}
        ></ButtonGroup>
        <ButtonGroup
          className="abc-editor__btns absolute top-2 left-2 opacity-0 group-hover:opacity-100"
          btns={leftBtns}
        ></ButtonGroup>
        <ButtonGroup
          className="abc-editor__btns absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
          btns={footerBtns}
        ></ButtonGroup>
      </>
    )

    const toolsView = (
      <div className="abc-editor__previewer-tools z-10">
        <div className="" style={{ display: 'none' }} ref={musicToolsRef}></div>
        {ready && (
          <div className="flex-center">
            <button onClick={handleDownloadWav}>
              <Icon name="icon-download"></Icon>
              <span>Wav</span>
            </button>
            <button onClick={handleDownloadMidi}>
              <Icon name="icon-download"></Icon>
              <span>Midi</span>
            </button>
            <button onClick={handleRestart}>
              <Icon name="icon-back"></Icon>
            </button>
            <button onClick={handleTogglePlay}>
              <Icon name={playing ? 'icon-pause' : 'icon-play'}></Icon>
            </button>
          </div>
        )}
        <div className="whitespace-nowrap">
          <span className="font-bold">{title}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="alpha-tab-element__duration">
            <div
              style={{ width: `${(currentSecond / endSecond) * 100}%` }}
              className="alpha-tab-element__duration--percentage"
            ></div>
          </div>
          <div className="alpha-tab-element__seconds flex-space-between">
            <span>{formatDuration(currentSecond / 1000)}</span>
            <span>{formatDuration(endSecond / 1000)}</span>
          </div>
        </div>

        <label>
          transpose
          <input
            className="transpose-half-steps"
            onChange={(e) => setTranspose(Number(e.target.value))}
            type="number"
            min="-12"
            max="12"
            step="1"
            defaultValue={transpose}
          />
        </label>
        <Selector
          className={cx('alpha-tab-element__trigger alpha-tab-element__selector')}
          lists={playInstruments}
          onChange={handlePlayIntrumentChange}
        ></Selector>
      </div>
    )

    return (
      <div
        {...attributes}
        {...divProps}
        data-slate-tablature={instrument}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="hidden">{children}</div>
        <div
          className={cx(
            'abc-editor rounded-lg group box-border text-sm select-none',
            {
              'relative my-4 p-4': !fullscreen,
              'abc-editor--fullscreen fixed m-0 p-0 rounded-none top-0 left-0 flex flex-row':
                fullscreen,
              'abc-editor--extend': extend,
              'select-element after:rounded-lg': selected && !editable && !fullscreen,
            },
            {
              'select-element-1': selected,
              'select-element-2': editable,
              'select-element-3': fullscreen,
            }
          )}
          contentEditable={false}
        >
          {btnsView}

          {editable && (
            <textarea
              className={cx(
                'abc-editor__content rounded-lg p-2 pt-6 box-border border-none outline-none resize-y overflow-y-scroll w-full min-h-32'
              )}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoFocus
            ></textarea>
          )}
          {!text && !editable && (
            <div
              onClick={() => setEditable(true)}
              className="relative z-10 h-10 flex items-center justify-start pl-2 cursor-pointer"
            >
              <Icon name="icon-list-music" className="opacity-50 text-xl mr-2"></Icon>
              <div className="font-bold opacity-50 text-sm">Edit an abc music</div>
            </div>
          )}
          <div className="abc-editor__previewer" style={!text && !editable ? { height: 0 } : {}}>
            <div ref={musicSheetRef}></div>
            {/* <svg className="absolute inset-0 w-full h-full">
              <line ref={musicCursorRef} x1={80} y1={60} x2={81} y2={240} stroke="red"></line>
            </svg> */}
          </div>
          {fullscreen && toolsView}
        </div>
      </div>
    )
  }
)

function formatDuration(seconds: number) {
  const minutes = (seconds / 60) | 0
  seconds = (seconds - minutes * 60) | 0
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}
export default ABCElement
