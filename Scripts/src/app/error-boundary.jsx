import * as React from 'react';
import PropTypes from 'prop-types';

const logErrorToMyService = (error, info) => { 
    console.log(error);
    console.log(info);
}

class ErrorBoundary extends React.Component {
    static defaultProps = {
        onErrorCaught: (error, info) => {}
    }

    constructor(props) {
        super(props);

        this.state = { 
            hasError: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        logErrorToMyService(error, info);
        this.props.onErrorCaught(error, info);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}

export { ErrorBoundary as default };