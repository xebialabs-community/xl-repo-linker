var RlInput = React.createClass({

    propTypes: {
        item: React.PropTypes.object.isRequired,
        valid: React.PropTypes.bool,
        onChange: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            value: this.props.item.value
        }
    },

    handleChange: function (evt) {
        this.props.onChange(evt.target.value);
        this.setState({value: event.target.value});
    },

    render: function () {

        var className = 'message';
        var item = this.props.item;
        var itemType = item.type;

        if (!this.props.valid) {
            className = 'error-message';
        }

        if (itemType === 'enum') {
            return <select className={className} onChange={this.handleChange} value={this.state.value}>
                {
                    item.options.map(function (item) {
                        return <option>{item}</option>;
                    })
                }
            </select>;
        } else if (itemType === 'password') {
            return <input type='password' name={item.name} value={item.value} onChange={this.handleChange} className={className}/>;
        }

        return <input name={item.name} value={item.value} onChange={this.handleChange} className={className}/>;
    }
});