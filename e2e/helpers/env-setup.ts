import { devices } from '@playwright/test'
import dotenv from 'dotenv'
dotenv.config({path: './e2e/.env'})

export function getenv(name:string):string{
    const param = process.env[name]
    if (param==null) {
        throw new Error(name + ' not defined in .env')
    } 
    return param
}


export let useProject: Object
if (process.env.CI) {
    useProject =  {
      name: 'Chrome',
      use: { ...devices['Desktop Chrome'] }
    }
} 
else if(getenv('ENV')=='QA') {
     useProject =  {
      name: 'Chrome',
      use: { ...devices['Desktop Chrome'] }
    }
} else {
  useProject = {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
}



