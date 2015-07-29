var ConfigForm = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        errors: React.PropTypes.object.isRequired,
        updateValues: React.PropTypes.func
    },

    onClick: function () {
        this.props.updateValues(this.state.data);
        this.state = undefined;
    },

    componentWillUpdate: function (nextProps) {
        if (!this.state) {
            if (nextProps.data && nextProps.errors) {
                this.setState({data: nextProps.data});
                this.setState({errors: nextProps.errors});
            }
        }
    },

    handleChange: function (item) {
        var dataCopy = _.cloneDeep(this.props.data);
        _.find(dataCopy.groups[item.groupedKey], {'key': item.key}).value = item.value;
        this.setState({data: dataCopy});
    },

    render: function () {

        var form, errorPanel, updateButton;
        var $this = this;


        if (this.state) {

            var originalData = this.state.data.groups;
            var errors = this.state.errors;

            if (errors.fields) {
                errorPanel = <div className="errorPanel">
                    <ul>
                        <li>{errors.configValidation}</li>
                    </ul>
                </div>;
            }

            updateButton = <div className="controlPanel">
                {errorPanel}
                <span className="updateButtonPanel">
                    <button onClick={this.onClick} className="btn btn-primary pull-right">
                        Update
                    </button>
                </span>
            </div>;


            var groupedKeys = _.keys(originalData);

            form = <div>
                {
                    groupedKeys.map(function (groupedKey) {
                        return (<ConfigPanel groupedKey={groupedKey} data={originalData} errors={errors}
                                             onChange={$this.handleChange}/>);
                    })
                }
            </div>;
        }

        return <div className="configuration">
            {updateButton}
            {form}
        </div>;
    }
});