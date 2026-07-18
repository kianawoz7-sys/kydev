"use client";

import { CircleAlert, LogIn } from "lucide-react";
import { useActionState } from "react";

import {
  loginAction,
  type LoginActionState,
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-7 space-y-5" noValidate>
      {state.errors?.form?.[0] ? (
        <div
          className="flex gap-3 rounded-lg border-2 border-ink bg-secondary/25 p-3 text-sm font-semibold"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{state.errors.form[0]}</p>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-bold" htmlFor="email">
          Email
        </label>
        <Input
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          aria-invalid={Boolean(state.errors?.email)}
          autoComplete="email"
          className="mt-2"
          disabled={isPending}
          id="email"
          name="email"
          placeholder="admin@contoh.id"
          type="email"
        />
        {state.errors?.email?.[0] ? (
          <p className="mt-2 text-sm font-semibold text-secondary" id="email-error">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold" htmlFor="password">
          Password
        </label>
        <Input
          aria-describedby={state.errors?.password ? "password-error" : undefined}
          aria-invalid={Boolean(state.errors?.password)}
          autoComplete="current-password"
          className="mt-2"
          disabled={isPending}
          id="password"
          name="password"
          placeholder="Masukkan password"
          type="password"
        />
        {state.errors?.password?.[0] ? (
          <p
            className="mt-2 text-sm font-semibold text-secondary"
            id="password-error"
          >
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? (
          "Memproses login..."
        ) : (
          <>
            <LogIn aria-hidden="true" className="size-4" />
            Masuk
          </>
        )}
      </Button>
    </form>
  );
}
