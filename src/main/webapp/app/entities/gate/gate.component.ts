import { Component, OnInit, OnDestroy, Renderer, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { AccountService } from 'app/core/auth/account.service';

import { LoginService } from 'app/core/login/login.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';

@Component({
  selector: 'jhi-gate',
  templateUrl: './gate.component.html'
})
export class GateComponent implements OnInit, OnDestroy {
  currentAccount: any;
  eventSubscriber: Subscription;
  authenticationError: boolean;

  loginForm = this.fb.group({
    username: [''],
    password: [''],
    rememberMe: [false]
  });

  constructor(
    // protected testService: TestService,
    protected jhiAlertService: JhiAlertService,
    protected eventManager: JhiEventManager,
    protected accountService: AccountService,
    private loginService: LoginService,
    private stateStorageService: StateStorageService,
    private elementRef: ElementRef,
    private renderer: Renderer,
    private router: Router,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // eslint-disable-next-line no-console
    console.log('GATE WOOO');
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  login() {
    this.loginService
      .login({
        username: this.loginForm.get('username').value,
        password: this.loginForm.get('password').value,
        rememberMe: this.loginForm.get('rememberMe').value
      })
      .then(() => {
        this.authenticationError = false;
        this.activeModal.dismiss('login success');
        if (
          this.router.url === '/account/register' ||
          this.router.url.startsWith('/account/activate/') ||
          this.router.url.startsWith('/account/reset/')
        ) {
          this.router.navigate(['']);
        }

        this.eventManager.broadcast({
          name: 'authenticationSuccess',
          content: 'Sending Authentication Success'
        });

        // previousState was set in the authExpiredInterceptor before being redirected to login modal.
        // since login is successful, go to stored previousState and clear previousState
        const redirect = this.stateStorageService.getUrl();
        if (redirect) {
          this.stateStorageService.storeUrl(null);
          this.router.navigateByUrl(redirect);
        }
        // } else {
        //   this.stateStorageService.storeUrl(null);
        //   this.router.navigate(['/']);
        // }
        // this.stateStorageService.storeUrl(null);
        // this.router.navigateByUrl('/');
      })
      .catch(() => {
        this.authenticationError = true;
      });
  }

  register() {
    this.activeModal.dismiss('to state register');
    this.router.navigate(['/account/register']);
  }

  requestResetPassword() {
    this.activeModal.dismiss('to state requestReset');
    this.router.navigate(['/account/reset', 'request']);
  }
}