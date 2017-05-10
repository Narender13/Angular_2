

import { ActivatedRoute }           from '@angular/router';
import { Message }                  from 'primeng/primeng';
import { Observable }               from 'rxjs/Observable';

import { ConfigurationService }     from './configuration.service';
import { WindowDefinitionService }  from './window.definition/window.definition.service';
import { WindowDefinitionDto,
         RuleDomainTableDataRowsDto,
         DataRowDto }               from './window.definition/window.definition.dtos';

export class BaseComponent {

    protected API_RESPONSE = {
        SUCCESS : '200',
        UNAUTHORIZED : '401',
        INTERNAL_SERVER_ERROR : '500',
        GENERIC_ERROR : '100',
        NO_DATA_FOUND : '600'
    };

    protected userId: string = null;
    protected userToken: string = null;
    protected tenantId: string = null;
    protected username: string = null;
    protected password: string = null;

    // array of messages to display in a toast
    // add to your html: <p-messages [value]="messages"></p-messages>
    protected messages: Message[] = [];

    constructor(private _activeRoute: ActivatedRoute, private _windowDefService: WindowDefinitionService) {

        this._activeRoute.queryParams.subscribe(
            (param: String) => {

                this.userId = param['userId'];
                // console.log('base class query param user id: ' + this.userId);

                this.userToken = param['userToken'];
                // console.log('base class query param user token: ' + this.userToken);

                this.username = param['u'];
                // console.log('base class query param username token: ' + this.username);

                this.password = param['p'];
                // console.log('base class query param password token: ' + this.password);

                this.tenantId = param['tenantId'];
                // console.log('base class query param tenant id: ' + this.tenantId);

                ConfigurationService.userId = this.userId;
                ConfigurationService.usertoken = this.userToken;
                ConfigurationService.username = this.username;
                ConfigurationService.password = this.password;
                ConfigurationService.setTenantId(this.tenantId);
            }
        );
    }

    protected getWindowDefinition(windowTitle: string): any {
        return this._windowDefService.getWindowDefinition(windowTitle);
    }

    protected handleError(error: any, message?: string, summary?: string) {
        let errMessage: string = message;
        let err: string = error.toString();

        if (error !== null && error !== undefined) {
            if (err === 'Response with status: 0  for URL: null') {
                errMessage = errMessage + '  [Server unreachable]';
            } else if (err.includes('404 Not Found')) {
                errMessage = errMessage + '  [Web Service not found]';
            } else if (err.includes('Connection timed out')) {
                errMessage = errMessage + '  [Connection timed out]';
            } else if (err.includes('403 Forbidden')) {
                errMessage = errMessage + '  [Permissions Issue]';
            }
        }

        this.showErrorMessage(errMessage, summary);

        console.error(errMessage + ', Error: ' + error);
    }

    protected log(message: string) {
        // TODO: Enabled logging for troubleshooting. Can be turned off later
        // if (process.env.ENV === 'development') {
            console.log(message);
        // }
    }

    protected showErrorMessage(message: string, summary?: string) {
        this.messages = [];
        this.messages.push({severity: 'error', summary: summary, detail: message});
    }

    protected showWarnMessage(message: string, summary?: string) {
        this.messages = [];
        this.messages.push({severity: 'warn', summary: summary, detail: message});
    }

    protected showInfoMessage(message: string, summary?: string) {
        this.messages = [];
        this.messages.push({severity: 'info', summary: summary, detail: message});
    }

    protected showSuccessMessage(message: string, summary?: string) {
        this.messages = [];
        this.messages.push({severity: 'success', summary: summary, detail: message});
    }
}
