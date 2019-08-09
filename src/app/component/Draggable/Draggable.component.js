/* eslint-disable react/no-unused-state */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './Draggable.style';

class Draggable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            originalX: 0,
            translateX: 0,
            lastTranslateX: 0,
            prevActiveSlider: 0
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.draggableRef.current !== null) {
            const { activeSlide } = props;
            const { prevActiveSlider } = state;
            const slideSize = props.draggableRef.current.clientWidth;

            if (prevActiveSlider !== activeSlide) {
                return {
                    prevActiveSlider: activeSlide,
                    lastTranslateX: Math.round(slideSize * activeSlide)
                };
            }
        }
        return null;
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }

    handleTouchStart({ touches }) {
        window.addEventListener('touchmove', this.handleTouchMove);
        window.addEventListener('touchend', this.handleTouchEnd);

        if (touches.length === 1) this._handleDragStart(touches[0]);
    }

    handleMouseDown(event) {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);

        event.preventDefault();
        this._handleDragStart(event);
    }

    _handleDragStart({
        clientX
    }) {
        const { onDragStart } = this.props;

        if (onDragStart) onDragStart();

        this.setState({
            originalX: clientX,
            isDragging: true
        });
    }

    handleTouchMove({ touches }) {
        if (touches.length === 1) this.handleMouseMove(touches[0]);
    }

    handleMouseMove({
        clientX
    }) {
        const { isDragging } = this.state;

        if (!isDragging) return;

        this.setState(({
            originalX,
            lastTranslateX
        }) => ({
            translateX: clientX - originalX + lastTranslateX
        }), () => {
            const { onDrag } = this.props;
            if (onDrag) onDrag({ ...this.state, clientX });
        });
    }

    handleTouchEnd() {
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);

        this._handleDragEnd();
    }

    handleMouseUp() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);

        this._handleDragEnd();
    }

    _handleDragEnd() {
        const { onDragEnd } = this.props;

        onDragEnd(this.state, newState => this.setState({
            ...newState,
            isDragging: false,
            translateX: 0
        }));

        // TO STAY WHERE RELEASED
        // originalX: 0,
        // lastTranslateX: translateX,

        // TO RETURN INTO INITIAL
        // originalX: 0,
        // lastTranslateX: 0
    }

    render() {
        const {
            children,
            handleFocus,
            draggableRef,
            mix
        } = this.props;

        return (
            <div
              block="Draggable"
              mix={ mix }
              ref={ draggableRef }
              onMouseDown={ this.handleMouseDown }
              onTouchStart={ this.handleTouchStart }
              onFocus={ () => handleFocus() }
              tabIndex={ 0 }
              role="button"
              aria-label="Draggable area"
            >
                { children }
            </div>
        );
    }
}

Draggable.propTypes = {
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    handleFocus: PropTypes.func,
    onDrag: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    mix: PropTypes.shape({
        block: PropTypes.string,
        elem: PropTypes.string,
        mods: PropTypes.objectOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.bool
            ])
        )
    }),
    draggableRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ])
};

Draggable.defaultProps = {
    onDragStart: () => {},
    onDragEnd: (state, callback) => {
        const { translateX } = state;

        callback({
            originalX: 0,
            lastTranslateX: translateX
        });
    },
    onDrag: () => {},
    handleFocus: () => {},
    draggableRef: () => {},
    mix: {}
};

export default Draggable;
