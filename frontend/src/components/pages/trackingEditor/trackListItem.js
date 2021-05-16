import React, {Component} from 'react';
import './TrackingEditor.css';


class TrackListItem extends Component {

    state = {
        color: undefined
    }

    // static getDerivedStateFromProps(props, state) {
    //     let color = props.bBox.my.selected ? 'FFF' : props.bBox.cornerColor
    //     return {color};
    // }

    render() {
        let bBox = this.props.bBox;
        let style = {borderColor: this.props.bBox.cornerColor};
        console.log("rendering TrackListItem " + bBox.my.id);
        if(this.props.bBox.my.selected) {
            console.log("This one is selected!");
            style = {color: 'FFF'};
        }
        let selectedStyle = {color: 'FFF'};


        // style = {color: this.state.color};
        console.log(style);
        return (
            <div className={"TrackListItem" + (bBox.my.selected ? " selected" : "")} style={style}>
                <h1 className={"TrackListItemId" + (bBox.my.selected ? " selected" : "")}> {this.props.bBox.my.id} </h1>
                <button onClick={this.props.blink.bind(this, bBox)}> Blink </button>
            </div>
        );
    }
}

export default TrackListItem;