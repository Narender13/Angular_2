
import { Injectable } from '@angular/core';

@Injectable()
export class ShowDialogService {

    public isHelpVisible: boolean = false;
    public isSubmit: boolean = false;
    public helpText: string = '';

    public showDialog(displayHelpText: string, isHelpVisible, isSubmit ) {
        this.isHelpVisible = isHelpVisible;
        this.isSubmit = isSubmit;
        this.helpText = displayHelpText;
    }
}
