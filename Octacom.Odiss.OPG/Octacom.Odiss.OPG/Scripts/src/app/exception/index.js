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

        this.state = {referenceNo:'', comment:'', message:'', resubmitcomment: '', archivePermitted: true, resubmitPermitted: true};

    }

    getActionPermission(actionName){  //ArchiveDocuments
        const url = window.__baseUrl + 'api/users/haspermission/' + actionName;

    }

    archiveDoc(props){
        $('#lbl_message').addClass('alert alert-danger');
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
            if(responseData.status === 1){
                $('#lbl_message').removeClass('alert-danger');
                $('#lbl_message').addClass('alert-success');
            }

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
        $('#lbl_message2').addClass('alert alert-danger');
        http.post(window.__baseUrl + 'api/documents/' + window.__invoiceTabState.documentId, {appId:window.__invoiceTabState.appId, action: 'Resubmit',archiveComment:this.state.resubmitcomment })
            .then(results => results.data)
            .then((responseData) => {
                if(responseData.status === 1){
                    $('#lbl_message2').removeClass('alert-danger');
                    $('#lbl_message2').addClass('alert-success');
                }

                this.state.message = responseData.message;
                $('#lbl_message2').text(this.state.message);
            });
    }

    render () {
        var paddingStyle = { padding: '10px' };
        var padding817Style = { padding:'8px 17px' };
        var style80width ={width:'80%'};
        var disableResize = {resize:'none'};
        var padding5 = {padding:'5px', position:'relative'}
        var buttonStyle = {position:'absolute', bottom:'20px', right:'10px'};

        var styleArchivePermitted;
        var styleResubmitPermitted;
        if (this.state.archivePermitted === false){
            styleArchivePermitted = {visibility:hidden};
        }
        if (this.state.resubmitPermitted === false){
            styleResubmitPermitted = {visibility:hidden};
        }

        return <div className="panel">
            <ul className="nav nav-sidebar" role="tab" id="exception-actions"  style={styleArchivePermitted} >
                <li><a className="collapsed" role="button" data-toggle="collapse" href="#panExceptionActions" aria-expanded="false" aria-controls="panExceptionActions">Archive</a></li>
            </ul>
            <div id="panExceptionActions"  className="panel-collapse collapse panel-in" role="tabpanel" aria-labelledby="exception-actions">                
                <div style={padding817Style}>

                    <div className="">
                        <div className="  h-200" style={padding5}>
                            <div >
                                Reference No: <input type="textbox" inputMode="numeric" onChange={this.handleReferenceNoChange.bind(this)} value={this.state.referenceNo} name="tb_referenceNo" id="tb_referenceNo" />
                            </div>    
                        </div>
                        <div>
                            <div >
                                <textarea rows="5"  style={disableResize} className="form-control" onChange={this.handleCommentChange.bind(this)} placeholder="Comment" name="tb_comment" id="tb_comment" >
                                {this.state.comment}</textarea>
                            </div>    
                        </div>

                        <div>
                            <div  style={padding5}>
                                <button style={buttonStyle} className="btn btn-sm btn-primary" onClick={this.archiveDoc} >Archive</button>
                            </div>                    
                        </div>

                        <div >
                            <div  className="" id="lbl_message">
                            </div>                        
                        </div>    

                    </div>
                </div>
            </div>

            <ul className="nav nav-sidebar" role="tab" id="exception-actions2" style={styleResubmitPermitted}>
                <li><a className="collapsed" role="button" data-toggle="collapse" href="#panExceptionActions2" aria-expanded="false" aria-controls="panExceptionActions2">Resubmit</a></li>
            </ul>

            <div id="panExceptionActions2" className="panel-collapse collapse panel-in" role="tabpanel" aria-labelledby="exception-actions2">

                <div style={padding817Style}>
                    <div className="">

                        <div >
                            <div>
                                <textarea rows="5"  style={disableResize} className="form-control" onChange={this.handleResubmitCommentChange.bind(this)} placeholder="Comment" name="tb_resubmitcomment" id="tb_resubmitcomment" >
                                {this.state.comment}</textarea>
                            </div>                         
                        </div> 
                        <div  style={padding5}>
                            <input type="button" style={buttonStyle} className="btn btn-sm btn-primary" value="Resubmit" onClick={this.resubmitDoc} />                        
                        </div> 

                        <div >
                            <div  className="" id="lbl_message2">
                            </div>                        
                        </div> 
                    </div>       
                </div>
                 
            </div>
        </div>
    }
}

export default ExceptionAction;