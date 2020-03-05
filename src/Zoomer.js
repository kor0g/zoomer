import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 410px;
  overflow: hidden;
  outline: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IMG = styled.img`
  width: 500px;
  height: 410px;
  outline: 1px solid blue;
  transform-origin: center center;
`;

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 410;

export class Zoomer extends React.Component {
  state = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false
  };

  offsetX = 0;
  offsetY = 0;
  container;
  image;
  dragStart = null;

  handleWheel = e => {
    // шаг 0.5
    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, this.state.scale - e.deltaY / 200)
    );

    const areaWidth = this.container.clientWidth;
    const areaHeight = this.container.clientHeight;

    // координаты курсора в container
    const clientX = e.pageX - this.container.offsetLeft;
    const clientY = e.pageY - this.container.offsetTop;

    // координаты курсора в container в % (от 0,0 до 1,1)
    const percentXInCurrentBox = clientX / areaWidth;
    const percentYInCurrentBox = clientY / areaHeight;

    const currentBoxWidth = areaWidth / this.state.scale;
    const currentBoxHeight = areaHeight / this.state.scale;

    const nextBoxWidth = areaWidth / nextScale;
    const nextBoxHeight = areaHeight / nextScale;

    // разница изменённых размеров и текущих умножаем на координаты курсора с началом координат по центру
    const deltaX =
      (nextBoxWidth - currentBoxWidth) * (percentXInCurrentBox - 0.5);
    const deltaY =
      (nextBoxHeight - currentBoxHeight) * (percentYInCurrentBox - 0.5);

    // смещаем относительно предыдущего смещения
    const nextOffsetX = this.offsetX - deltaX;
    const nextOffsetY = this.offsetY - deltaY;

    // ограничение на перемещение если ширина картинки больше ширины контейнера
    let stopMovementByX =
      this.image.clientWidth * nextScale < areaWidth ? 0 : 1;
    const unfilledEdgesByX =
      this.image.clientWidth * nextScale > areaWidth
        ? (areaWidth - this.image.clientWidth) / 2 * nextScale
        : 0;
    // по вертикали не нужно ограничивать, т.к. высота всегда быдет пропорционально совпадать

    // смещать соответственно scale
    const translateX = -1 * nextOffsetX * nextScale * stopMovementByX;
    const translateY = -1 * nextOffsetY * nextScale;

    // ограничить перемещение
    let limitedTranslateX =
      Math.sign(translateX) === -1
        ? Math.max(
            translateX,
            -1 * (areaWidth * nextScale - areaWidth) / 2 + unfilledEdgesByX
          )
        : Math.min(
            translateX,
            (areaWidth * nextScale - areaWidth) / 2 - unfilledEdgesByX
          );

    const limitedTranslateY =
      Math.sign(translateY) === -1
        ? Math.max(translateY, -1 * (areaHeight * nextScale - areaHeight) / 2)
        : Math.min(translateY, (areaHeight * nextScale - areaHeight) / 2);

    // перезаписываем
    this.offsetX = limitedTranslateX / nextScale * -1;
    this.offsetY = limitedTranslateY / nextScale * -1;

    this.setState({
      translateX: limitedTranslateX,
      translateY: limitedTranslateY,
      scale: nextScale
    });
  };

  startDrag = (clientX, clientY) => {
    this.dragStart = {
      ...this.state,
      clientX,
      clientY
    };
    this.setState({ isDragging: true });
  };

  handleMouseDragStart = e => this.startDrag(e.clientX, e.clientY);

  moveTo = (clientX, clientY) => {
    // перемещение за одно действие
    const deltaX = clientX - this.dragStart.clientX;
    const deltaY = clientY - this.dragStart.clientY;

    // суммированное перемещение от 0,0
    const unlimitedTranslateX = this.dragStart.translateX + deltaX;
    const unlimitedTranslateY = this.dragStart.translateY + deltaY;

    const x = unlimitedTranslateX;
    const y = unlimitedTranslateY;

    // границы для перемещаемой области
    const areaWidth = this.container.clientWidth;
    const areaHeight = this.container.clientHeight;
    const imgWidth = this.image.clientWidth;

    // масштабируемая область (проверяем, соответстует ли её размеры размерам области, в которой она находится)
    const zoomedWidth = Math.min(areaWidth, imgWidth) * this.state.scale;
    const zoomedHeight = areaHeight * this.state.scale;

    // ограничение на перемещение от 0,0 (начало координат посередине)
    const limitByX =
      zoomedWidth > areaWidth ? Math.abs(zoomedWidth - areaWidth) / 2 : 0;
    const limitByY =
      zoomedHeight > areaHeight ? Math.abs(zoomedHeight - areaHeight) / 2 : 0;

    // запрещаем перемещение карты по координатам, не входящих в диапазон ограничений (+-limitByX, +-limitByY)
    const translateX = Math.abs(x) < limitByX ? x : Math.sign(x) * limitByX;
    const translateY = Math.abs(y) < limitByY ? y : Math.sign(y) * limitByY;

    this.setState({
      translateX,
      translateY
    });

    this.offsetX = translateX / this.state.scale * -1;
    this.offsetY = translateY / this.state.scale * -1;
  };

  drag = (clientX, clientY) => {
    if (this.dragStart) {
      this.moveTo(clientX, clientY);
    }
  };

  handleMouseDrag = e => {
    e.preventDefault();
    this.drag(e.clientX, e.clientY);
  };
  handleDragEnd = () => {
    this.dragStart = null;
    this.setState({ isDragging: false });
  };

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.width !== this.props.width) {
  //     this.setState({
  //       translateX: 0,
  //       translateY: 0,
  //       scale: 1
  //     });

  //     this.offsetX = 0;
  //     this.offsetY = 0;
  //   }
  // }

  finalTransform = ({ translateX, translateY, scale }) => {
    const widthRatio =
      this.props.width < DEFAULT_WIDTH ? this.props.width / DEFAULT_WIDTH : 1;

    // пропорциональное изменение масштаба на основе текущего в зависимости от изменённой ширины
    const adjustedScale = widthRatio * scale;
    // перемещение карты соответственно текущим резмерам, scale
    const adjustedTranslateX = translateX; // adjustedScale;
    const adjustedTranslateY = translateY; // adjustedScale;

    // this.offsetX = adjustedTranslateX / scale * -1;
    // this.offsetY = adjustedTranslateY / scale * -1;

    // return `translate(${adjustedTranslateX}px, ${adjustedTranslateY}px) scale(${adjustedScale})`;
    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  setScale = scale => {
    const adjustedScale =
      this.props.width < DEFAULT_WIDTH ? this.props.width / DEFAULT_WIDTH : 1;

    // return `scale(${adjustedScale})`;
  };

  render() {
    const adjustedHeight =
      this.props.width > DEFAULT_WIDTH
        ? DEFAULT_HEIGHT
        : this.props.width * DEFAULT_HEIGHT / DEFAULT_WIDTH;
    return (
      <Container
        innerRef={ref => (this.container = ref)}
        onWheel={this.handleWheel}
        onMouseDown={this.handleMouseDragStart}
        onMouseMove={this.handleMouseDrag}
        onMouseUp={this.handleDragEnd}
        style={{ height: adjustedHeight }}
      >
        <div style={{ transform: this.setScale() }}>
          <IMG
            innerRef={ref => (this.image = ref)}
            style={{
              transition: `all ease ${this.state.isDragging ? 0 : 0.2}s`,
              transform: this.finalTransform({ ...this.state })
            }}
            src="https://avatars.mds.yandex.net/get-pdb/236760/0858de4f-ac25-45be-a8eb-31533273e7a6/s1200"
          />
        </div>
      </Container>
    );
  }
}
