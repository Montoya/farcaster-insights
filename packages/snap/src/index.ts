import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { panel, heading, text, row } from '@metamask/snaps-sdk';

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
