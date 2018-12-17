import React from 'react';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import http from '../services/api/http-client';
import { text } from '@fortawesome/fontawesome-svg-core';
import validator from 'validator';

//@inject('store')
@observer
class ExceptionAction extends React.Component {
    constructor(props) {
        super(props); 
         // This binding is necessary to make `this` work in the callback
        this.archiveDoc = this.archiveDoc.bind(this);
        this.resubmitDoc = this.resubmitDoc.bind(this);

        this.state = {referenceNo:'', comment:'', message:'', resubmitcomment: ''};

    }

    archiveDoc(props){
        if (!validator.isNumeric(this.state.referenceNo)) {
            this.state.message = "Please enter a valid reference number.";
            $('#lbl_message').text(this.state.message);
            return;
        }

        if (this.state.comment.length < 10 || this.state.comment.length>1000){
            this.state.message = "Please enter at least 10 characters, and maximum of 1000 characters for archive comments.";
            $('#lbl_message').text(this.state.message);
            return;
        }

        const url =  window.__baseUrl + 'api/documents/'+ window.__invoiceTabState.documentId;
        console.log('base: ' + window.__baseUrl + ';posting to:' + url);
        http.post(url, {appId:window.__invoiceTabState.appId, action:'Archive', referenceNo:this.state.referenceNo, archiveComment:this.state.comment})
            .then(results => results.data)
            .then((responseData) => {
            console.log(responseData.status);  
            this.state.message = responseData.message;
            $('#lbl_message').text(this.state.message);
        });
    }

    handleReferenceNoChange(event) {
        this.setState({ referenceNo: event.target.value })
    }

    handleCommentChange(event) {
        this.setState({ comment: event.target.value })
    }

    handleResubmitCommentChange(event) {
        this.setState({ resubmitcomment: event.target.value })
    }
      
    resubmitDoc(props) {
        http.post(window.__baseUrl + 'api/documents/' + window.__invoiceTabState.documentId, {appId:window.__invoiceTabState.appId, action: 'Resubmit',archiveComment:this.state.resubmitcomment })
            .then(results => results.data)
            .then((responseData) => {
                console.log(responseData.status);
                this.state.message = responseData.message;
                $('#lbl_message2').text(this.state.message);
            });
    }

    render () {
        var paddingStyle = { padding: '10px' };

        return <div className="panel">
            <ul className="nav nav-sidebar" role="tab" id="exception-actions">
                <li><a className="collapsed" role="button" data-toggle="collapse" href="#panExceptionActions" aria-expanded="false" aria-controls="panExceptionActions">Archive</a></li>
            </ul>
            <div id="panExceptionActions"  className="panel-collapse collapse panel-in" role="tabpanel" aria-labelledby="exception-actions">                
                <div style={paddingStyle}>

                    <div className="container">
                        <div className="row  h-200">
                            <div className="col-*-8">
                                <input type="number" placeholder="Reference No" pattern="[0-9]*"  inputMode="numeric" onChange={this.handleReferenceNoChange.bind(this)} value={this.state.referenceNo} name="tb_referenceNo" id="tb_referenceNo" />
                            </div>    
                        </div>

                        <div className="row">
                            <div className="col-*-8">
                                <br/><textarea rows="5" cols="100"  onChange={this.handleCommentChange.bind(this)} placeholder="Comment" name="tb_comment" id="tb_comment" >
                                {this.state.comment}</textarea>
                            </div>    
                        </div>

                        <div className="row">
                            <div className="col-*-8">
                                <button className="btn btn-sm btn-primary" onClick={this.archiveDoc} >Archive</button>
                            </div>                    
                        </div>

                        <div  className="row">
                            <div  className="alert alert-info" id="lbl_message">
                            </div>                        
                        </div>    

                    </div>
                </div>
            </div>

            <ul className="nav nav-sidebar" role="tab" id="exception-actions2">
                <li><a className="collapsed" role="button" data-toggle="collapse" href="#panExceptionActions2" aria-expanded="false" aria-controls="panExceptionActions2">Resubmit</a></li>
            </ul>

            <div id="panExceptionActions2" className="panel-collapse collapse panel-in" role="tabpanel" aria-labelledby="exception-actions2">

                <div style={paddingStyle}>
                    <div className="container">

                        <div  className="row">
                            <div className="col-*-8">
                                <textarea rows="5" cols="100"  onChange={this.handleResubmitCommentChange.bind(this)} placeholder="Comment" name="tb_resubmitcomment" id="tb_resubmitcomment" >
                                {this.state.comment}</textarea>
                            </div>                         
                        </div> 
                        <div  className="row">
                            <input type="button" className="btn btn-sm btn-primary" value="Resubmit" onClick={this.resubmitDoc} />                        
                        </div> 

                        <div  className="row">
                            <div  className="alert alert-info" id="lbl_message2">
                            </div>                        
                        </div> 
                    </div>       
                </div>
                 
            </div>
        </div>
    }
}

export default ExceptionAction;