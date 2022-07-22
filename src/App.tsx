import { useState, useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AppBar, Button, Toolbar, TextField } from '@material-ui/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract';

import abi from './abi.json';
import { AdressForm } from './components/AdressForm/AdressForm';

type TokenInfo = {
  symbol: string;
  decimals: number; 
  name: string;
  balance: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      display: 'grid',
      justifyItems: 'start',
      gridGap: '20px',
      padding: '20px 24px'
    },
    info: {
      paddingLeft: 0,
      listStyle: 'none'
    }
  }),
);

const CONTRACT_ADDRESS = '0xE640AF7F2fD9218D7C4329910d8eE9a5164d0b8e';

function App() {
  const classes = useStyles();
  
  const [contract, setContract] = useState<Contract>();
  const [account, setAccount] = useState('');
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const web3 = new Web3(Web3.givenProvider || 'ws://localhost:3000');

  useEffect(() => {
    web3.eth.requestAccounts()
      .then((accounts) => {
        setAccount(accounts[0]);
        return accounts[0];
      }, 
      (e) => {console.log(e)})
  }, [account])

  const getTokenInfo = async(tokenContract: Contract) => {
    const [decimals, name, symbol, balance] = await Promise.all([
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
      tokenContract.methods.name().call(),
      tokenContract.methods.balanceOf(account).call(),
    ]);
    return { decimals, name, symbol, balance };
  }

  const onCheckToken = async(adress: string) => {
    try {
      if (web3 && account) {
        const contract = new web3.eth.Contract(
          abi as AbiItem[],
          adress
        );
        setContract(contract);
        
        const {decimals, name, symbol, balance} = await getTokenInfo(contract);
        
        setToken({
          symbol: symbol,
          decimals: decimals,
          name: name,
          balance: web3.utils.fromWei(balance, 'ether'),
        });
      }
    } catch(e) {
      console.log(e);
      setError('Enter correct token adress');
      setToken(null);
    }
  }

  const onApprove = () => {
    if (web3) {
      const value = web3.utils.toWei(amount.toString(), 'ether');

      contract?.methods
        .transfer(CONTRACT_ADDRESS, value)
        .send({
          from: account
        },(e: Error) => console.log(e.message))
    }
  }
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <h1>Unit protocol test task for front-end developers.</h1>
        </Toolbar>
      </AppBar>
      <div className={classes.content}>
        <AdressForm onCheckToken={onCheckToken} errorMessage={error} setErrorMessage={setError}/>

        {token && (
          <>
            <ul className={classes.info}>
              <li>SYMBOL: {token.symbol}</li>
              <li>DECIMALS: {token.decimals}</li>
              <li>NAME: {token.name}</li>
            </ul>
            <TextField 
              error={amount > Number(token?.balance) || amount < 0} 
              helperText={amount > Number(token?.balance) ? 'too much' : ''} 
              variant="outlined" 
              type="number" 
              label="enter amount" 
              InputProps={{ inputProps: { min: 0 } }}
              onChange={(val) => {setAmount(Number(val.target.value))}}
            />
            <Button 
              variant="contained" 
              onClick={onApprove} 
              disabled={amount > Number(token?.balance) || amount <= 0}
            >
              Approve
            </Button>
          </>
        )}
     </div>
    </>
  );
}

export default App;