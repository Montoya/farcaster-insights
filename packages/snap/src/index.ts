import type { OnTransactionHandler, OnHomePageHandler, OnUserInputHandler } from '@metamask/snaps-sdk';
import { panel, heading, text, row, input, button } from '@metamask/snaps-sdk';

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {

  if(transaction.to) { 
    // assume a valid address

    const response = await fetch(`https://homerow.club/fc/name.php?address=${transaction.to}`); 

    const data = await response.json(); 

    const insights = []; 

    if(data[transaction.to]) { 
      const user = data[transaction.to][0]; 
      insights.push(text("This is a known Farcaster account:")); 
      if(user.custody_address===transaction.to) { 
        insights.push(row("Address Type",text("Custody Address"))); 
      }
      else { 
        insights.push(row("Address Type",text("Verified Address"))); 
      }
      insights.push(row("Username", text(`[${user.username}](https://warpcast.com/${user.username})`))); 
      insights.push(row("Display Name", text(user.display_name))); 
      insights.push(row("Follower Count",text(''+user.follower_count))); 
    }
    else { 
      insights.push(text("This is not a known Farcaster account.")); 
    }
    return {
        content: panel([
            heading("Farcaster Insights"),
            ...insights,
        ]),
    };
  } 
  else { 
    return null; 
  }
};

export const onHomePage: OnHomePageHandler = async () => { 
  const interfaceId = await snap.request({
    method: "snap_createInterface",
    params: {
      ui: panel([
        input({ 
          name: 'input', 
          label: 'Enter an Ethereum address:'
        }),
        button({ 
          value: 'Search', 
          buttonType: 'button',
          name: 'search'
        }),
      ])
    },
  });
  return { 
    id: interfaceId
  }
}; 

export const onUserInput: OnUserInputHandler = async ({id, event}) => { 
  if(event.name !== 'search') return; 

  // get address input 
  const state = await snap.request({
    method: "snap_getInterfaceState",
    params: {
      id,
    },
  });
  const addressInput = state['input']; 
  if(!addressInput) return; 

  const address = `${addressInput}`.toLowerCase(); 

  // assume a valid address 
  const response = await fetch(`https://homerow.club/fc/name.php?address=${address}`); 
  const data = await response.json(); 

  const components = [
    input({ 
      name: 'input', 
      label: 'Enter an Ethereum address:',
      value: `${address}`
    }),
    button({ 
      value: 'Search', 
      buttonType: 'button',
      name: 'search'
    }),
  ];

  console.log(data); 

  if(data[`${address}`]) { 
    const user = data[`${address}`][0]; 
    components.push(text("This is a known Farcaster account:")); 
    if(user.custody_address===address) { 
      components.push(row("Address Type",text("Custody Address"))); 
    }
    else { 
      components.push(row("Address Type",text("Verified Address"))); 
    }
    components.push(row("Username", text(`[${user.username}](https://warpcast.com/${user.username})`))); 
    components.push(row("Display Name", text(user.display_name))); 
    components.push(row("Follower Count",text(''+user.follower_count))); 
  }
  else { 
    components.push(text("This is not a known Farcaster account.")); 
  }

  snap.request({
    method: "snap_updateInterface", 
    params: { 
      id,
      ui: panel(components),
    },
  }); 
}