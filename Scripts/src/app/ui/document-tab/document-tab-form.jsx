import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { getChildOfComponentType } from '../../helpers/react';

let DocumentTabForm = ({ children, ...props }) => (
    <Form {...props}>
        <table cellPadding="2" style={{ width: '100%' }}>
            <tbody>
                {children}
            </tbody>
        </table>
    </Form>
);

DocumentTabForm.Field = class DocumentTabFormField extends React.Component {
    render() {
        var label = getChildOfComponentType(this.props.children, DocumentTabFormLabel.name);
        var control = getChildOfComponentType(this.props.children, DocumentTabFormControl.name);

        if (label) {
            label = React.cloneElement(label, { controlId: this.props.controlId });
        }

        return <tr>
            <th style={{ paddingRight: '5px', verticalAlign: 'top' }}>
                {label}
            </th>
            <td style={{ paddingBottom: '3px' }}>
                <FormGroup controlId={this.props.controlId} bsSize="sm" style={{ position: 'relative' }} {...this.props}>
                    {control}
                </FormGroup>
            </td>
        </tr>;
    }
}

const DocumentTabFormFooter = ({ children }) => (<tr>
    <td colSpan="2" className="text-right">{children}</td>
</tr>);
DocumentTabForm.Footer = DocumentTabFormFooter;

const DocumentTabFormLabel = ({ controlId, children }) => (<ControlLabel htmlFor={controlId}>{children}</ControlLabel>);
DocumentTabForm.Label = DocumentTabFormLabel;

const DocumentTabFormControl = ({ validation, children }) => (<div>
    {children}
    <FormControl.Feedback />
    {validation && validation.isInvalid && <HelpBlock>{validation.message}</HelpBlock>}
</div>);
DocumentTabForm.Control = DocumentTabFormControl;

export default DocumentTabForm;