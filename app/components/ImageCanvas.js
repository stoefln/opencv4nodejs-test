var React = require('react')
const drawUtils = require('../lib/DrawUtils')
//import { SizeMe } from 'react-sizeme'

class ImageCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
    this.imgRef = React.createRef()
  }

  componentDidMount() {
    this.canvas = this.canvasRef.current
    this.ctx = this.canvas.getContext('2d')
    this.image = new Image()

    this.image.src = this.props.src
    this.image.onload = () => {
      console.log('onload', this.image)
      this.canvas.width = this.image.width
      this.canvas.height = this.image.height
      this.draw()
    }
  }
  componentDidUpdate() {
    this.draw()
  }

  draw() {
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
    this.ctx.strokeStyle = drawUtils.getRandomColor()
    this.props.matches.forEach(match => this.drawMatch(match))
  }

  drawMatch(match) {
    const position = match.getTopLeftInPixels(this.image)
    this.ctx.strokeRect(
      position.x,
      position.y,
      match.templateSizeInPixels(this.image).width,
      match.templateSizeInPixels(this.image).height
    )
    this.ctx.fillText('v: ' + match.value.toFixed(3), position.x, position.y)
  }

  render() {
    //return <SizeMe>{({ size }) => <div>{this.renderSized(size)}</div>}</SizeMe>
    return this.renderSized()
    /*return (
      <SizeMe>
        {  }
      </SizeMe>
    )*/
  }
  renderSized(size) {
    console.log('size', size)

    return (
      <div className="image-canvas">
        <canvas ref={this.canvasRef} style={{ width: this.props.width }} />
        <div>{this.props.matches.length}</div>
      </div>
    )
  }
}

export default ImageCanvas
