import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import messages from '../../resources/messages';

const localMessages = {
  allTopics: { id: 'menu.items.allTopics', defaultMessage: 'All Topics' },
};

class TopicsDrawer extends React.Component {

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  close = () => this.setState({ open: false });

  render() {
    const { user, handleMenuItemClick } = this.props;
    const { formatMessage } = this.props.intl;
    // gotta show login or logout correctly based on the user state
    let loginLogoutMenuItem = null;
    if (user.isLoggedIn) {
      loginLogoutMenuItem = (
        <MenuItem onTouchTap={() => { this.close(); handleMenuItemClick('/logout'); }}>
          <FormattedMessage {...messages.userLogout} />
        </MenuItem>
      );
    } else {
      loginLogoutMenuItem = (
        <MenuItem onTouchTap={() => { this.close(); handleMenuItemClick('/login'); }}>
          <FormattedMessage {...messages.userLogin} />
        </MenuItem>
      );
    }
    // only show app actions if they are logged in
    let appMenuItems = null;
    if (user.isLoggedIn) {
      appMenuItems = (
        <MenuItem onTouchTap={() => { this.close(); handleMenuItemClick('/home'); }}>
          <FormattedMessage {...localMessages.allTopics} />
        </MenuItem>
      );
    }
    // bring it all together in a controlled drawer
    return (
      <div>
        <IconButton
          iconClassName="material-icons"
          tooltip={formatMessage(messages.menuOpenTooltip)}
          onTouchTap={this.handleToggle}
        >
          menu
        </IconButton>
        <Drawer
          width={300}
          openSecondary
          docked={false}
          open={this.state.open}
          onRequestChange={(open) => this.setState({ open })}
        >
          <AppBar title={formatMessage(messages.menuTitle)} showMenuIconButton={false} />
          {appMenuItems}
          <MenuItem onTouchTap={() => { this.close(); handleMenuItemClick('/about'); }}>
            <FormattedMessage {...messages.menuAbout} />
          </MenuItem>
          <Divider />
          {loginLogoutMenuItem}
        </Drawer>
      </div>
    );
  }
}

TopicsDrawer.propTypes = {
  // state
  user: React.PropTypes.object.isRequired,
  // from dispatch
  handleMenuItemClick: React.PropTypes.func.isRequired,
  // from context
  intl: React.PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  handleMenuItemClick: (path) => {
    dispatch(push(path));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      TopicsDrawer
    )
  );
