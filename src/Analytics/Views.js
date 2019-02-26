import React from "react"
import {inject, observer} from "mobx-react"
import { Segment, Header, Menu, Icon, Table, Modal} from "semantic-ui-react"
import _ from 'lodash'
import { giveMeKey } from "../SharedCalculations/GiveMeKey";


@inject("UIStore", "AccountStore", "PoliciesStore", "AnnouncementsStore", "ResourcesStore", "TeamStore")
@observer
export class Views extends React.Component {
    render(){
        const {UIStore, AccountStore, PoliciesStore, AnnouncementsStore, ResourcesStore, TeamStore} = this.props

        const getLabel = (data) => {
           if(data.type === "announcement"){return AnnouncementsStore._getAnnouncement(data.id).label}
           else if(data.type === "policy"){return PoliciesStore._getPolicy(data.id).label}
           else if(data.type === "file"){return ResourcesStore._getFile(data.id).label}
           else if(data.type === "url"){return ResourcesStore._getUrl(data.id).label}
           else {return "No label available"}
        }

        const UItoLogKey={"announcements": "announcement", "faqs": "policy", "files":"file", "urls":"url"}
        const rawlogs = AccountStore.logs
            .filter(log => log.data.type === UItoLogKey[UIStore.menuItem.analyticsHeader])
            .map(log => log.data)
        let uniqueLogs = _.uniq(rawlogs.map(i => JSON.stringify(i)))
            .map(i => JSON.parse(i))
    
        uniqueLogs.forEach(log => {
            const dupes = uniqueLogs.filter(i => i.id === log.id)
            if(dupes.length > 0){
                if(log.variations === undefined){log.variations = []}
                log.variations = dupes.map(i => i.variation)
                delete log.variation } 
            uniqueLogs = uniqueLogs.filter(i => i.variations !== undefined || !dupes.map(i => i.id).includes(i.id))
            })

            const variData = (log) => {
                const content = log.type === "policy"? PoliciesStore._getPolicy(log.id) : AnnouncementsStore._getAnnouncement(log.id)
                const variation = (variID) => content.variations.filter(i => i.variationID === variID)
                const displayTeamTag = (variID) => {
                    const teamLabel = variation(variID)[0].teamID === "global"? "Global (all teams)" : TeamStore._getTeam(variation(variID)[0].teamID).label
                    const tagLabel = variation(variID)[0].tags.length === 0? "No Tags" : TeamStore._getTag(variation(variID)[0].tags[0]).label
                    return (`${teamLabel} / ${tagLabel}`)
                }
                const getContentLabel = (variID) => {
                    return variation(variID)[0].label === ""? content.label : variation(variID)[0].label
                }

                return log.variations.map(vari => 
                    <Table.Row key={"analyticsResult" + giveMeKey()}>
                     <Table.Cell>{getContentLabel(vari)}</Table.Cell>
                    <Table.Cell>{displayTeamTag(vari)}</Table.Cell>
                    <Table.Cell>{rawlogs.filter(i => i.variation === vari).length}</Table.Cell>
                    <Table.Cell>0</Table.Cell>
                    {UIStore.menuItem.analyticsHeader === "announcements" || UIStore.menuItem.analyticsHeader === "faqs"?
                             <React.Fragment>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.variationID === vari  && i.sentiment === 2).length}</Table.Cell>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.variationID === vari  && i.sentiment === 1).length}</Table.Cell>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.variationID === vari &&  i.sentiment === 0).length}</Table.Cell>
                               </React.Fragment>
                                : null }
                    </Table.Row>
                ) }
            const varis = (log) => {
                return log.variations.length === 1? 
                <Table.Cell>{getLabel(log)}</Table.Cell>
                :
                <Modal size="small"
                trigger={
                <Table.Cell style={{color: "#2FC7F8", cursor: "pointer"}}>{getLabel(log)}</Table.Cell>
            }
                >
                    <Modal.Content>
                    <Header as="h3">{getLabel(log)}</Header>
                    <Table basic="very" >
                     <Table.Header>
                         <Table.Row>
                             <Table.HeaderCell>Label</Table.HeaderCell>
                             <Table.HeaderCell>Audience</Table.HeaderCell>
                             <Table.HeaderCell>Portal Views</Table.HeaderCell>
                             <Table.HeaderCell>Email Clicks</Table.HeaderCell>
                             {UIStore.menuItem.analyticsHeader === "announcements" || UIStore.menuItem.analyticsHeader === "faqs"?
                             <React.Fragment>
                               <Table.HeaderCell ><Icon name='smile outline' /></Table.HeaderCell>
                               <Table.HeaderCell><Icon name='meh outline' /></Table.HeaderCell>
                               <Table.HeaderCell><Icon name='frown outline' /></Table.HeaderCell>
                               </React.Fragment>
                                : null }
                         </Table.Row>
                     </Table.Header>
                     <Table.Body>
                     {variData(log)}
                     </Table.Body>
                     </Table>
                    </Modal.Content>
                </Modal>
            }
        
        const displayResults = uniqueLogs.map(log => 
            <Table.Row key={"analyticsResult" + giveMeKey()}>
               {varis(log)}
                <Table.Cell>{rawlogs.filter(i => i.id === log.id).length}</Table.Cell>
                <Table.Cell>0</Table.Cell>
                {UIStore.menuItem.analyticsHeader === "announcements" || UIStore.menuItem.analyticsHeader === "faqs"?
                             <React.Fragment>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.ID === log.id  && i.sentiment === 2).length}</Table.Cell>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.ID === log.id  && i.sentiment === 1).length}</Table.Cell>
                               <Table.Cell>{AccountStore.sentiments.filter(i => i.ID === log.id &&  i.sentiment === 0).length}</Table.Cell>
                               </React.Fragment>
                                : null }
            </Table.Row>
            )

        return(
            <Segment style={{marginRight: 50}}>
            <Header as="h3"> <Icon name="chart line" />Views</Header>
            <Menu secondary>
            <Menu.Item
              name='announcements'
              active={UIStore.menuItem.analyticsHeader === "announcements"}
              onClick={e => UIStore.set("menuItem", "analyticsHeader", "announcements")}
            />
             <Menu.Item
              name={`faqs`}
              active={UIStore.menuItem.analyticsHeader === "faqs"}
              onClick={e => UIStore.set("menuItem", "analyticsHeader", "faqs")}
            />
               <Menu.Item
              name='Files'
              active={UIStore.menuItem.analyticsHeader === "files"}
              onClick={e => UIStore.set("menuItem", "analyticsHeader", "files")}
            />
               <Menu.Item
              name='urls'
              active={UIStore.menuItem.analyticsHeader === "urls"}
              onClick={e => UIStore.set("menuItem", "analyticsHeader", "urls")}
            />
            </Menu>
            <Table basic="very">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Label</Table.HeaderCell>
                    <Table.HeaderCell>Portal Views</Table.HeaderCell>
                    <Table.HeaderCell>Email Clicks</Table.HeaderCell>
                               {UIStore.menuItem.analyticsHeader === "announcements" || UIStore.menuItem.analyticsHeader === "faqs"?
                             <React.Fragment>
                               <Table.HeaderCell><Icon name='smile outline' /></Table.HeaderCell>
                               <Table.HeaderCell><Icon name='meh outline' /></Table.HeaderCell>
                               <Table.HeaderCell><Icon name='frown outline' /></Table.HeaderCell>
                               </React.Fragment>
                                : null }
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {displayResults}
            </Table.Body>
            </Table>
           
            </Segment>
          
        )
    }
}