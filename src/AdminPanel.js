import React from "react";

import ManageContent from "./SharedUI/ManageContent/ManageContent"
import Header from "./Header/Header";
import { Responsive, Transition } from "semantic-ui-react"
import { inject, observer } from "mobx-react";
import { Switch, Route, Redirect } from "react-router-dom";
import { SideBar } from "./SideBar/SideBar";
import { CardFrame } from "./CardFrame/CardFrame";
import NewEditVariation from "./SharedUI/NewEditContent/NewEditVariation";
import { TeamFrame } from "./Teams/TeamFrame";
import { ResourcesFrame } from "./Resources/ResourcesFrame";
import AnnouncementsFrame from "./Announcements/AnnouncementsFrame";
import { BaseSettings } from "./Settings/BaseSettings";
import { UserSettings } from "./Settings/UserSettings";
import { EmailFrame } from "./Email/EmailFrame";
import  DashboardFrame  from "./Dashboard/DashboardFrame";
import { AnalyticsFrame } from "./Analytics/AnalyticsFrame"
import SuperAdminFrame from "./SuperAdmin/SuperAdminFrame"
import { EditAccounts } from "./SuperAdmin/EditAccounts"
import { CreateAccounts } from "./SuperAdmin/CreateAccounts"
import { EditUsers } from "./SuperAdmin/EditUsers"
import { CreateUsers } from "./SuperAdmin/CreateUsers"
import { Analytics } from "./SuperAdmin/Analytics"
import { loadAdmin } from "./DataExchange/LoadProfile";

@inject( "UserStore", "UIStore", )
@observer
export class AdminPanel extends React.Component {
  componentDidMount() {
    const { UserStore, UIStore } = this.props;
    if (!UIStore._adminLoadingComplete) {
      UserStore.setPreviewTeam("")
      UserStore.setPreviewTag("")
      loadAdmin()
    }
  }
  render() {
    const { UIStore, UserStore } = this.props;

    const accountOptions = () => []

    const checkMobile = (width) => {
      if(width < 992){
        UIStore.set("responsive", "isMobile", true)
      }
      else{
          UIStore.set("responsive", "mobileNav", false)
          UIStore.set("responsive", "isMobile", false)
        }
    }

    const superAdminPath = UserStore.user !== null && UserStore.user.isSuperAdmin !== undefined && UserStore.user.isSuperAdmin === true? <Route path="/panel/superadmin" component={SuperAdminFrame} exact /> : null

    const loadingDisplay = !UIStore._adminLoadingComplete ? (
      <div />
    ) : (
      <div className="SideAndAction">
        <Responsive {...Responsive.onlyComputer} fireOnMount={true} onUpdate={(e, val) => checkMobile(val.getWidth())}>
        <SideBar />
        </Responsive>
        <Transition visible={UIStore.responsive.mobileNav} animation='fade right' duration={500}>
          <div style={{marginTop: 40, position: "fixed", zIndex: 50}}> 
          <div style={{float: "left"}}>
            <SideBar />
          </div>
          <div style={{height: 800, width: 992}} onClick={e => UIStore.set("responsive", "mobileNav", false)}/> 
        </div>
        </Transition>
        <div className="ActionFrame" style={UIStore.sideNav.activePrimary === "superadmin"? {  backgroundColor: "#151515"} : null}>
        
          <Switch location={this.props.location}>
            <Route path="/panel/faqs" component={CardFrame} exact />
            <Route path="/panel/faqs/manage-policy/:id" component={ManageContent} exact />
            <Route path="/panel/faqs/policy-variation/:id" render={props => <NewEditVariation {...props} mode="policy" /> }/>
            <Route path="/panel/teams" component={TeamFrame} />
            <Route path="/panel/resources" component={ResourcesFrame} />
            <Route path="/panel/announcements" component={AnnouncementsFrame} exact/>
            <Route path="/panel" component={DashboardFrame} exact/>
            <Route path="/panel/analytics" component={AnalyticsFrame} />
            <Route path="/panel/announcements/manage-announcement/:id" component={ManageContent} exact />
            <Route path="/panel/announcements/announcement-variation/:id" render={props => <NewEditVariation {...props} mode="announcement" />} />
            <Route path="/panel/base-settings" component={BaseSettings} />
            <Route path="/panel/user-settings" component={UserSettings} />
            <Route path="/panel/email" component={EmailFrame} />
            {superAdminPath}
            <Route path="/panel/superadmin/edit-account" component = {props => <EditAccounts accounts={accountOptions()} {...props}/>} exact/>
            <Route path="/panel/superadmin/create-account" component={CreateAccounts} exact/>
            <Route path="/panel/superadmin/edit-user" component={EditUsers} exact/>
            <Route path="/panel/superadmin/create-user" component={CreateUsers} exact/>
            <Route path="/panel/superadmin/analytics" component = {props => <Analytics accounts={accountOptions()} {...props}/>} exact/>
            <Route path="/panel/*">
                <Redirect push to="/panel"/>
           </Route>

          </Switch>
        </div>
        <Header />
      </div>
    );

    return <React.Fragment>{loadingDisplay}</React.Fragment>;
  }
}
