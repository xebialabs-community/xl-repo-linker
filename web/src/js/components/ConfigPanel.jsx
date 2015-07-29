var ConfigPanel = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        errors: React.PropTypes.object.isRequired,
        groupedKey: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    componentWillUpdate: function (nextProps) {
        if (!this.state) {
            if (nextProps.data) {
                this.setState({data: nextProps.data});
            }
            if (nextProps.errors) {
                this.setState({errors: nextProps.errors});
            }
        }
    },

    handleChange: function (key, value) {
        var dataCopy = _.cloneDeep(this.props.data);
        _.find(dataCopy[this.props.groupedKey], {'key': key}).value = value;
        this.setState({data: dataCopy});
        this.props.onChange({value: value, key: key, groupedKey: this.props.groupedKey});
    },

    render: function () {

        var panel = (<div></div>);

        if (this.state) {
            var originalData = this.state.data;
            var errors = this.state.errors;
            var groupedKey = this.props.groupedKey;

            var $this = this;

            panel = (<div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">{this.props.groupedKey}</h3>
                </div>
                <div className="panel-body">
                    {
                        originalData[this.props.groupedKey].map(function (item) {
                            var label = item.name;
                            var invalid = !_.isEmpty(errors) && _.contains(errors.fields, groupedKey + '.' + item.key);

                            return (<div className="row">
                                <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">{label}</div>
                                <div className="col-xs-4 col-sm-8 col-md-8 col-lg-8">
                                    <RlInput item={item} onChange={$this.handleChange.bind(null, item.key)} valid={!invalid}/>
                                </div>
                            </div>);
                        })
                    }

                </div>
            </div>);
        }

        return panel;
    }
});