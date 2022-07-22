import { FC, useState } from 'react';
import { Button,TextField } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';

type Props = {
  onCheckToken: (adress: string) => void,
  errorMessage: string,
  setErrorMessage: (message: string) => void,
}

const useStyles = makeStyles(() =>
  createStyles({
    form: {
      display: 'grid',
      justifyItems: 'start',
      gridGap: '20px',
      padding: '20px 0',
      width: "100%",
      maxWidth: '450px'
    },
  }),
);

export const AdressForm: FC<Props> = ({ onCheckToken, errorMessage, setErrorMessage }) => {
  const classes = useStyles();
  const [adress, setAdress] = useState('');

  const onChangeAdress = (val: React.ChangeEvent<HTMLInputElement>) => {
    setAdress(val.target.value)
    if (adress.length === 0) {
      setErrorMessage('');
    }
  }

  const onButtonClick = () => {
    onCheckToken(adress);
  }

  return (
    <form className={classes.form}>
      <TextField fullWidth variant="outlined" label="enter token adress" onChange={onChangeAdress}/>
      <Button variant="contained" onClick={onButtonClick} disabled={adress.length === 0}>Check token adress</Button>
      {(adress.length > 0 && errorMessage.length > 0) && <p>{errorMessage}</p>}
    </form>
  )
}