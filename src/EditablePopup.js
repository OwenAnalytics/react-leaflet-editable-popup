import React from 'react'
import ReactDOMServer from 'react-dom/server';
import { Popup } from 'react-leaflet'
import ContentEditable from 'react-contenteditable'
import Parser from 'html-react-parser';
import './editable-popup.css'

const prefix = 'leaflet-popup-button'


class EditablePopup extends React.Component{

   componentDidMount(){
      // This is admittedly hacky as hell
      // If you have a better idea of how to implement a popup being open when the map loads, please let me know or open a pull request!
      if (this.props.open){
         setTimeout( () => {
            this.thePopup.leafletElement._source.openPopup()
         },0.001)
      }
   }

   // Checking if what the author passes in is an HTML string or a JSX element, and parses accordingly (there may be a better way to do this):
   parsedChildren = this.props.children.$$typeof ? ReactDOMServer.renderToStaticMarkup(this.props.children) : this.props.children

   state = {
      editScreenOpen: false,
      inputValue: this.parsedChildren,
      content: this.parsedChildren,
   }

   openEditScreen = () => {
      this.setState({editScreenOpen: true})
   }

   closeEditScreen = () => {
      this.setState({editScreenOpen: false})
   }

   handleEdits = (e) => {
      this.setState({inputValue: e.target.value})
   }

   saveEdits = () => {
      if (!isNaN(this.props.sourceKey) && this.props.saveContentCallback){
         this.props.saveContentCallback(this.state.inputValue, this.props.sourceKey)
      }
      this.setState({
         content: this.state.inputValue,
      })
      this.closeEditScreen()
   }

   cancelEdits = () => {
      this.setState({
         inputValue: this.state.content
      })
      this.closeEditScreen()
   }

   removeSource = () => {
      if(!this.props.sourceKey){
         this.thePopup.leafletElement._source.remove()
      } else if( (this.props.sourceKey || this.props.sourceKey ===0 ) && this.props.removalCallback){
         this.props.removalCallback(this.props.sourceKey)
      }
   }



   render(){

      let Buttons;

      if (this.props.removable && !this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} remove`} onClick={this.removeSource} >Remove this marker</button>
            </div>
         )
      } else if (!this.props.removable && this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} edit`} onClick={ this.openEditScreen }>Edit</button>
            </div>
         )
      } else if (this.props.removable && this.props.editable){
         Buttons = (
            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} remove`} onClick={this.removeSource} >Remove this marker</button>
               <button onClick={ this.openEditScreen } className={`${prefix} edit`}>Edit</button>
            </div>
         )
      }

      const contentScreen = (
         <>
            {Parser(this.state.content)}
            {/*}  { (typeof this.state.content === 'string') && Parser(this.state.content)}  */}
            {Buttons}
         </>
      )

      const editScreen = (
         <>
            <ContentEditable className="leaflet-popup-input" html={this.state.inputValue} ref="editableDiv" onChange={ this.handleEdits } />

            <div className="leaflet-popup-useraction-buttons">
               <button className={`${prefix} cancel`} onClick={this.cancelEdits} >Cancel</button>
               <button className={`${prefix} save`} onClick={this.saveEdits} >Save</button>
            </div>
         </>
      )

      return(
         <Popup {...this.props} ref={thePopup => this.thePopup = thePopup} minWidth="160">
            {this.state.editScreenOpen ? editScreen : contentScreen}
         </Popup>
      )
   }
}



export default EditablePopup
