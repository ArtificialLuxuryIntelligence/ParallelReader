//Different Nav options in Widgetdepending on page "type"

// In premium there will be extra parameter for extra features

// nav buttons
const allOptions = {
  OPTIONS: 'OPTIONS',
  MYWORDS: 'MYWORDS',
  PLLVIEW: 'PLLVIEW',
  PLLSYNC: 'PLLSYNC',
  HELP: 'HELP',
  CLOSE: 'CLOSE',
};

const { OPTIONS, MYWORDS, PLLVIEW, PLLSYNC, HELP, CLOSE } = allOptions;

export default function getNavOptions(type) {
  switch (type) {
    case 'welcome':
      return { MYWORDS, OPTIONS, CLOSE };
    case 'options':
      return { MYWORDS, HELP, CLOSE };
    case 'my words':
      return { OPTIONS, HELP, CLOSE };
    case 'help':
      return { OPTIONS, MYWORDS, CLOSE };

    case 'reader':
      return { OPTIONS, MYWORDS, PLLSYNC, PLLVIEW, HELP, CLOSE };

    // widget displaying error or loading
    case 'loader':
      return {};
    case 'loadererror':
      return { OPTIONS, MYWORDS, HELP, CLOSE };

    default:
      return {};
  }
}
