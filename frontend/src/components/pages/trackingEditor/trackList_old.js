import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import './TrackingEditor.css';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

// const useStyles = makeStyles((theme) => ({
//     root: {
//         backgroundColor: theme.palette.background.paper,
//         width: 500,
//     },
// }));

function TrackList(props) {
    console.log("TrackList props.children");
    console.log(props.children);

    // const [value, setValue] = React.useState(0);
    //
    // // from docs, not sure what the difference between index and value is?
    // const handleChangeIndex = (index) => {
    //     setValue(index);
    // };
    //
    return (
        <div className="TrackList">
            {/*<div className="TrackListTabs">*/}
            {/*    <AppBar position="static" color="default">*/}
            {/*        <Tabs*/}
            {/*            value={value}*/}
            {/*            // onChange={handleChange}*/}
            {/*            indicatorColor="primary"*/}
            {/*            textColor="primary"*/}
            {/*            variant="fullWidth"*/}
            {/*            aria-label="full width tabs example"*/}
            {/*        >*/}
            {/*            <Tab label="Players" {...a11yProps(0)} />*/}
            {/*            <Tab label="Corners" {...a11yProps(1)} />*/}
            {/*            <Tab label="Groups" {...a11yProps(2)} />*/}
            {/*        </Tabs>*/}
            {/*    </AppBar>*/}
            {/*</div>*/}
            {/*<div className="TrackListList" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}} >*/}
            {/*    <SwipeableViews*/}
            {/*        axis= {'x-reverse'}// {theme.direction === 'rtl' ? 'x-reverse' : 'x'}*/}
            {/*        index={value}*/}
            {/*        onChangeIndex={handleChangeIndex}*/}
            {/*    >*/}
            {/*        <TabPanel value={value} index={0} dir={'rtl'}> /!*{theme.direction}>*!/*/}
            {/*            {props.children}*/}
            {/*        </TabPanel>*/}
            {/*        <TabPanel value={value} index={1} dir={'rtl'}> /!*{theme.direction}>*!/*/}
            {/*            Item Two*/}
            {/*        </TabPanel>*/}
            {/*        <TabPanel value={value} index={2} dir={'rtl'}> /!*{theme.direction}>*!/*/}
            {/*            Item Three*/}
            {/*        </TabPanel>*/}
            {/*    </SwipeableViews>*/}
            {/*</div>*/}


            <div className="TrackList">
                <div className="TrackListTabs">
                    Selection Placeholder
                </div>

                <div className="TrackListList" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}} >
                    {props.children}
                </div>
            </div>
        </div>
    );

}

export default TrackList;