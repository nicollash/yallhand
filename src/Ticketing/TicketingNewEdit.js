import React from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Segment, Button, Form, Header, Checkbox, Grid, Dropdown, Divider } from "semantic-ui-react";
import { Collapse } from '@material-ui/core';
import { TicketingItem } from "./TicketingItem";
import { Col, Row } from "reactstrap";
import { ChooseTargeting } from "../SharedUI/ChooseTargeting";
import { ContentSearch} from "../SharedUI/ContentSearch";
import { BundleContent } from "../SharedUI/Bundle/BundleContent";

import { giveMeKey } from "../SharedCalculations/GiveMeKey";
import BackButton from "../SharedUI/BackButton";
import { ticket, surveyEdit, schedule } from "../DataExchange/PayloadBuilder";
import { createTicket, modifySurvey, createSchedule, deleteSchedule } from "../DataExchange/Up";
import { ScheduleStore } from "../Stores/ScheduleStore";
import { validate } from "../SharedCalculations/ValidationTemplate";
import { arrayValUpOrDown } from "../SharedCalculations/ArrayValUpOrDown";

import { iconKey, iconOptions } from "./IconSelect";

import _ from "lodash";

@inject("TicketingStore", "ChannelStore", "AccountStore")
@observer
class TicketingNewEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticketItems: this.reset(true),
      label: "",
      chanID: "All",
      teamID: "",
      tags: [],
      assoc: [],
      type: "simple",
      access: "default",
      active: false,
      icon: "",
      isTemplate: true,
      sendTargetType: "all",
      sendToTagID: "",
      sendToTeamID: "",
      sendToUsers: [],
      admins: [],
      collaborators: [],
      config: {
        simpleDesc: false,
        notifyAdminNewTicket: false,
        deleteTicket: false,
        updateOpener: false
      }
    };
  }

  reset(init) {
    if (init) {
      return [
        {
          id: giveMeKey(),
          isOpen: true,
          defaultAssignee: "",
          data: [], //{type: "", label: "", options: []}
          _requireInfo: false
        },
        {
          id: giveMeKey(),
          defaultAssignee: "",
          isClose: true,
          data: [], //{type: "", label: "", options: []}
          _requireInfo: false
        }
      ];
    } else
      return {
        id: giveMeKey(),
        defaultAssignee: "",
        data: [{ type: "text", label: "", options: [] }], //{type: "", label: "", options: []}
        _requireInfo: false
      };
  }

  updateState(obj) {
    if (Object.keys(obj).includes("config"))
      this.setState({ config: Object.assign(this.state.config, obj.config) });
    else this.setState(obj);
  }

  validateFields = () => {
    const {
      label,
      access,
      targetType,
      admins,
      targetConfig,
      deadline,
      surveyItems,
      instances
    } = this.state;
    const conditions = {
      Title: Boolean(label),
      Admins: access !== "custom" || admins.length
    };
    return validate(conditions).valid;
  };

  updateFields = (fieldObj, i) => {
    let ticketList = this.state.ticketItems;
    let newData = Object.assign(ticketList[i], fieldObj);
    ticketList.splice(i, 1, newData);
    this.setState({
      ticketItems: ticketList
    });
  };

  shiftRow = (direction, index) => {
    let questionList = this.state.ticketItems;
    const val = questionList[index];
    questionList.splice(index, 1);
    questionList.splice(direction === "up" ? index - 1 : index + 2, 0, val);
    this.setState({ surveyItems: questionList });
  };

  removeRow = async id => {
    let questionList = await this.state.ticketItems;
    questionList = questionList.filter(i => i._id !== id);
    this.setState({ surveyItems: questionList });
  };

  checkMultiRow = () => {
    if (this.state.ticketItems.length > 1) {
      return true;
    }
    return false;
  };

  displayTicketItems = () => {
    return this.state.ticketItems.map((stage, index) => {
      return (
        <TicketingItem
          multipleRows={this.checkMultiRow()}
          label={stage.label}
          isClose={stage.isClose}
          key={"ticketItemDisplay" + index}
          totalItemsCount={this.state.ticketItems.length}
          index={index}
          id={stage.id}
          defaultAssignee={stage.defaultAssignee}
          _requireInfo={stage._requireInfo}
          data={stage.data}
          updateFields={this.updateFields}
          removeRow={this.removeRow}
          shiftRow={this.shiftRow}
          add={this.addItem}
          newLine={() => {
            if (index + 1 === this.state.ticketItems.length) this.addItem();
          }}
        />
      );
    });
  };

  addItem = () => {
    this.setState({ ticketItems: [...this.state.ticketItems, this.reset()] });
  };

  updateTicket = async (active = null) => {
    // await this.setState({active});
    // if (active !== null) await this.setState({active});
    // if (active === false) modifySurvey({surveyID: this.state.surveyID, updated: Date.now(), active: false, type: this.props.mode});
    // else if (this.state.surveyID) await modifySurvey(surveyEdit(this.props.mode,this.state));
    // else {

    if (this.validateFields())
      await createTicket(ticket(this.state))
        .then(res => res.json())
        .then(res => this.setState({ surveyID: res.surveyID }));

    // if (this.validateFields()) await console.log(ticket(this.state)); //TEST

    // }
    // if (active !== null) {
    //   if(active && this.state.deadline) createSchedule(schedule(this.state.deadline,`end ${this.props.mode}`,{id: this.state.surveyID}), false);
    //   else if(!active && this.state.deadline) deleteSchedule(ScheduleStore.allScheduled.filter(sch => sch.data.id === this.state.surveyID && !sch.executed)[0].scheduleID);
    // }
  };

  removeSuggestedContent = val => {
    const {assoc} = this.state;
    const updatedBundle= assoc.filter(
      item => Object.values(item)[0] !== Object.values(val)[0]
    );
    this.setState({assoc: updatedBundle});
  };
  
  moveSuggestedContent = (val, direction) => {
    const {assoc} = this.state;
    const updatedBundle = arrayValUpOrDown( assoc, val, direciton );
    this.setState({assoc: updatedBundle});
  };




  componentDidMount(active = null) {
    const { TaskStore, TicketingStore } = this.props;
    const id = this.props.match.params.id;
    const loadTicket = this.props.match.params.id
      ? TicketingStore.allTickets.filter(i => i.ticketID === id)[0]
      : false;
    if (loadTicket) {
      // if(loadTicket.surveyItems.length) {
      //   loadSurvey.surveyItems.forEach(i=> Object.keys(i).forEach(key=> {if(key[0]==="_") delete i[key]} ))
      // }
      this.setState(loadTicket);
    }
  }

  render() {
    const { ChannelStore, AccountStore } = this.props;

    const launch = (
      <Button onClick={e => this.updateTicket(true)} primary>
        {" "}
        Launch{" "}
      </Button>
    );
    const save = <Button onClick={e => this.updateTicket()}> Save </Button>;
    const stop = (
      <Button negative onClick={() => this.updateTicket(false)}>
        Stop
      </Button>
    );
    const cancel = (
      <Button onClick={e => this.props.history.push("/panel/surveys")}>
        {" "}
        Cancel{" "}
      </Button>
    );
    const preview = <Button onClick={e => {}}> Preview </Button>;
    const actions = this.state.active ? (
      <div style={{ paddingTop: 5 }}>
        {" "}
        {save} {stop} {preview}
      </div>
    ) : (
      <div style={{ paddingTop: 5 }}>
        {" "}
        {launch} {save} {cancel} {preview}
      </div>
    );

    const { type, active, chanID, label, admins, icon, collaborators, access, assoc } = this.state;
    return (
      <div>
        <BackButton />

        <Header as="h2" style={{ padding: 0, margin: 0 }}>
          New Request Template  
          <Header.Subheader>
            Employees create new tickets via the employee portal
          </Header.Subheader>
        </Header>
        <Row>
          <Col style={{ marginTop: 10 }}>
            <Segment>
              {/* <Header style={{ paddingBottom: 15 }} as="h4">
                General Settings
              </Header> */}
              <Form>
                <Form.Input
                  className="FixSemanticLabel"
                  style={{ maxWidth: 400 }}
                  label="Title"
                  required
                  placeholder="e.g. Open service request"
                  value={label}
                  onChange={(e, val) => this.updateState({ label: val.value })}
                >
                  <input maxLength={48} />
                </Form.Input>
              </Form>
              {!active && (
                <>
                  <div style={{ paddingTop: 5, paddingBottom: 10 }}>
                    {" "}
                    <ChooseTargeting
                      label="Grant access to open ticket"
                      output={val => this.updateState(val)}
                      input={this.state}
                    />{" "}
                  </div>

                  <Form style={{ maxWidth: 400 }}>
                    <Form.Field className="FixSemanticLabel" style={{ minWidth: 370 }}>
                      <label>Ticketing Type</label>
                      <Grid columns={2} relaxed="very" stackable>
                        <Grid.Column>
                          <div onClick={()=>this.updateState({type: "simple"})} className={type === "simple"? "PlanOption PlanActive" : "PlanOption"}>
                            <h4>Simple</h4>
                            <p>Basic open/close ticketing</p>
                          </div>
                        </Grid.Column>
                        <Grid.Column>
                        <div onClick={()=>this.updateState({type: "enhanced"})}  className={type !== "simple"? "PlanOption PlanActive" : "PlanOption"}>
                            <h4>Enhanced</h4>
                            <p>Design your own multi-step ticketing</p>
                          </div>
                        </Grid.Column>
                      </Grid>
                    </Form.Field>

                    {/* <Form.Dropdown value={type} onChange={(e,val)=>this.updateState({type: val.value})} label="Ticketing Type" style={{minWidth: 370}} selection options={[{"text":"Simple", "value":"simple", "description":"basic open/close ticketing"},{"text":"Enhanced", "value":"enhanced", "description":"multistep or customized ticketing"}]} /> */}
                    <Form.Dropdown
                      value={access}
                      onChange={(e, val) =>
                        this.updateState({ access: val.value })
                      }
                      label="Ticket Admin Settings"
                      className="FixSemanticLabel"
                      style={{ minWidth: 370 }}
                      selection
                      options={[
                        {
                          text: "Yallhands Admin Only",
                          value: "default",
                          // description:
                          //   "Typical settings/Yallhands admin fulfill"
                        },
                        {
                          text: "Customize...",
                          value: "custom",
                          // description: "Customize access and notifications"
                        }
                      ]}
                    />
                    <Collapse in={this.state.access === "custom"}>
                      <Form>
                        <Form.Dropdown
                          onChange={(e, val) =>
                            this.updateState({ admins: val.value })
                          }
                          value={admins}
                          options={AccountStore._getUsersSelectOptions()}
                          label="Select admin(s)"
                          className="FixSemanticLabel"
                          fluid
                          multiple
                          selection
                          placeholder="Select user(s)..."
                        />
                        <p style={{ padding: "0px", marginTop: "-15px" }}>
                          <span style={{ fontSize: "0.7em" }}>
                            Admins can edit all tickets and collaborators under
                            this template
                          </span>
                        </p>

                        <Form.Dropdown
                          label="Select collaborator(s)"
                          className="FixSemanticLabel"
                          admin={collaborators}
                          onChange={(e, val) =>
                            this.updateState({ collaborators: val.value })
                          }
                          options={AccountStore._getUsersSelectOptions()}
                          fluid
                          multiple
                          selection
                          placeholder="Select user(s)..."
                        />
                        <p style={{ padding: "0px", marginTop: "-15px" }}>
                          <span style={{ fontSize: "0.7em" }}>
                            Collaborators can edit and view history of tickets
                            that have been assigned to them
                          </span>
                        </p>

                        <Form.Field>
                          <Checkbox
                            checked={this.state.config.notifyAdminNewTicket}
                            onChange={(e, val) =>
                              this.updateState({
                                config: { notifyAdminNewTicket: val.checked }
                              })
                            }
                            label="Email admin(s) when a new ticket is opened"
                          />
                        </Form.Field>
                        <Form.Field>
                          <Checkbox
                            checked={this.state.config.deleteTicket}
                            onChange={(e, val) =>
                              this.updateState({
                                config: { deleteTicket: val.checked }
                              })
                            }
                            label="Allow admin(s) to delete tickets"
                          />
                        </Form.Field>

                        <Form.Field>
                          <Checkbox
                            checked={this.state.config.updateOpener}
                            onChange={(e, val) =>
                              this.updateState({
                                config: { updateOpener: val.checked }
                              })
                            }
                            label="Keep user who opens ticket updated of status"
                          />
                        </Form.Field>
                      </Form>
                    </Collapse>
                    <Divider />
                    <Form>
                      <Form.Group>
                      <Form.Dropdown
                      value={chanID}
                      className="FixSemanticLabel"
                      onChange={(e, val) =>
                        this.updateState({ chanID: val.value })
                      }
                      options={ChannelStore._channelSelect}
                      selection
                      label="Channel"
                    />
                    <Form.Dropdown
                      value={"Star"}
                      label="Button Icon"
                      // placeholder="Choose icon..."
                      // onChange={(e, val)=>this.updateState({icon: val.value})}
                      icon={iconKey["Star"]}
                      disabled
                      // selection options={iconOptions}
                    ></Form.Dropdown>
                      </Form.Group>
                      <Form.Group>
                      <Form.Field className="FixSemanticLabel">
                        <label>Suggest content to requester</label>
                        <ContentSearch output={res => {if(!assoc.filter(i=>i.value === res.value).length) this.updateState({assoc: [...assoc, {type: res.type, value: res.value}]})}}/>
                        {Boolean(assoc.length) &&
                        <BundleContent
                        input={assoc}
                        remove={val => this.removeSuggestedContent(val)}
                        moveUp={val => this.moveSuggestedContent(val, "up")}
                        moveDown={val => this.moveSuggestedContent(val, "up")}
                      />
                        }
                      </Form.Field>
                      </Form.Group>
                    </Form>
                  
                  </Form>
                </>
              )}
            </Segment>
          </Col>
          {/* {this.state.access === "custom" &&
          <Col style={{marginTop: 10}}  xl={6}>
          <Segment className="TicketingAccess" style={{margin: 10}} style={{backgroundColor: "#e9e9e9"}}>
          <Header style={{paddingBottom: 15}} as="h4">Access</Header>
                  <Form>
                <Form.Dropdown onChange={(e, val)=>this.updateState({admins: val.value})} value={admins} options={AccountStore._getUsersSelectOptions()} label="Select admin(s)"  fluid multiple selection placeholder="Select user(s)..." />
                <p style={{padding: "0px", marginTop: "-15px"}}><span style={{fontSize: "0.7em"}}>Admins can edit all tickets and collaborators under this template</span></p>

                <Form.Dropdown label="Select collaborator(s)" admin={collaborators} onChange={(e, val)=>this.updateState({collaborators: val.value})} options={AccountStore._getUsersSelectOptions()}  fluid multiple selection placeholder="Select user(s)..." />
                <p style={{padding: "0px", marginTop: "-15px"}}><span style={{fontSize: "0.7em"}}>Collaborators can edit and view history of tickets that have been assigned to them</span></p>
       
                <Form.Field>
                      <Checkbox checked={this.state.config.notifyAdminNewTicket} onChange={(e,val)=> this.updateState({config: {notifyAdminNewTicket: val.checked}})} label="Email admin(s) when a new ticket is opened"/>
                    </Form.Field>
                    <Form.Field>
                      <Checkbox checked={this.state.config.deleteTicket} onChange={(e,val)=> this.updateState({config: {deleteTicket: val.checked}})}  label="Allow admin(s) to delete tickets"/>
                    </Form.Field>
                    
                  <Form.Field>
                      <Checkbox checked={this.state.config.updateOpener} onChange={(e,val)=> this.updateState({config: {updateOpener: val.checked}})} label="Keep user who opens ticket updated of status"/>
                    </Form.Field>
               
                  </Form>
                </Segment>
          </Col>
          } */}
        </Row>

        {type === "simple" ? (
          <Segment>
            <Header>
              Simple Ticket
              <Header.Subheader>
                User information will automatically be passed along when this
                ticket is opened
              </Header.Subheader>
            </Header>
            <Form.Checkbox
              checked={this.state.config.simpleDesc}
              onChange={(e, val) =>
                this.updateState({ config: { simpleDesc: val.checked } })
              }
              label="Include a 'description' field for user to enter additional text"
            />
          </Segment>
        ) : (
          <>
            {this.displayTicketItems()}
            <div style={{ padding: "20px 0 20px" }}>
              <Button
                primary
                circular
                icon="plus"
                onClick={() => this.addItem()}
              />
            </div>
          </>
        )}

        {actions}
      </div>
    );
  }
}
export default withRouter(TicketingNewEdit);
