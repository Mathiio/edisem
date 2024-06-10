import { Omk } from './omk';

interface AuthParams {
    apiOmk?: string;
    mail?: string;
    ident?: string;
    key?: string;
}

export class Auth {
    private apiOmk: string | false;
    private mail: string | false;
    private ident: string | false;
    private key: string | false;
    private omk: any;
    private userAdmin: boolean;
    private user: any;

    constructor(params: AuthParams) {
        this.apiOmk = params.apiOmk ? params.apiOmk : false;
        this.mail = params.mail ? params.mail : false;
        this.ident = params.ident ? params.ident : false;
        this.key = params.key ? params.key : false;
        this.omk = false;
        this.userAdmin = false;
        this.user = false;
    }

    public getUser(cb: ((user: any) => void) | null): void {
        // vérifie la connexion à OMK
        this.apiOmk = this.apiOmk ? this.apiOmk : (document.getElementById("authServer") as HTMLInputElement).value;
        if (this.apiOmk) this.apiOmk += this.apiOmk.slice(-1) == '/' ? "" : "/";
        this.mail = this.mail ? this.mail : (document.getElementById("authMail") as HTMLInputElement).value;
        this.ident = this.ident ? this.ident : (document.getElementById("authIdent") as HTMLInputElement).value;
        this.key = this.key ? this.key : (document.getElementById("authPwd") as HTMLInputElement).value;

        if (!this.mail || !this.ident || !this.key || !this.apiOmk) {
            if (cb) cb(this.user);
        } else {
            this.omk = new Omk({ 'api': this.apiOmk, 'key': this.key, 'ident': this.ident, 'mail': this.mail });
            this.omk.getUser((u: any) => {
                if (!u) {
                    this.showAlert('alertMail');
                    this.user = false;
                    this.omk = false;
                } else {
                    this.user = u;
                    this.userAdmin = this.user["o:role"] == 'global_admin';
                    document.getElementById("userLogin")!.innerText = this.user['o:name'];
                    const btnLogin = document.getElementById("btnLogin")!;
                    btnLogin.className = 'btn btn-danger';
                    btnLogin.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
                    this.user.id = this.user['o:id'];
                    this.hideModal('modalAuth');
                }
                if (cb) cb(this.user);
            });
        }
    }

    private showAlert(alertId: string): void {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.classList.remove('hidden');
        }
    }

    private hideModal(modalId: string): void {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.classList.add('hidden');
        }
    }
}
