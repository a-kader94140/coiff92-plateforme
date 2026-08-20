"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

/* Règle du système, appliquée par la structure et non par la discipline :
   le libellé est au-dessus, l'aide ou l'erreur en dessous. Une indication
   placée uniquement dans le champ disparaît dès qu'on saisit, elle ne
   remplace jamais un libellé. */

type FieldProps = {
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
};

export function Field({ label, help, error, optional, children }: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : help ? helpId : undefined;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-text">
        {label}
        {optional && <span className="text-muted-2"> , facultatif</span>}
      </label>

      {children({ id, describedBy })}

      {error ? (
        <span id={errorId} role="alert" className="mt-1.5 text-[13px] text-accent-ink">
          {error}
        </span>
      ) : help ? (
        <span id={helpId} className="mt-1.5 text-[13px] text-muted-2">
          {help}
        </span>
      ) : null}
    </div>
  );
}

const control =
  "w-full rounded-sm border bg-surface px-3 py-2.5 text-[15px] text-text " +
  "placeholder:text-muted-3 transition-colors duration-150 " +
  "disabled:opacity-[0.38] disabled:cursor-not-allowed";

/* Le survol renforce la bordure d'un champ normal, mais ne doit pas
   effacer celle d'un champ en erreur : survoler une erreur ne la
   résout pas. */
const controlBorder = (invalid?: boolean) =>
  invalid
    ? "border-accent"
    : "border-[var(--divider)] hover:border-[var(--muted-3)]";

export function Input({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(control, controlBorder(invalid), className)}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(control, controlBorder(invalid), "cursor-pointer", className)}
    >
      {children}
    </select>
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(control, controlBorder(invalid), "min-h-22 resize-y", className)}
    />
  );
}

/* Variante segmentée du groupe exclusif, pour deux à quatre options
   courtes qui se comparent d'un coup d'oeil : un créneau, un tri.

   L'état retenu est peint par `:has(input:checked)` et non par une classe
   calculée en React. La différence compte : sans JavaScript, le navigateur
   coche quand même le bouton radio, et le segment se colore quand même.
   Une classe calculée, elle, resterait figée sur le rendu initial.

   Trois signaux distinguent le segment retenu, pas seulement la couleur :
   l'aplat, le liseré intérieur, et l'état coché lu par les lecteurs
   d'écran. */
type SegmentedProps = {
  legend: string;
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string;
  error?: string;
  help?: string;
};

export function SegmentedRadio({
  legend,
  name,
  options,
  defaultValue,
  error,
  help,
}: SegmentedProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <fieldset className="flex flex-col border-0 p-0">
      <legend className="mb-1.5 block p-0 text-[13px] font-medium text-text">
        {legend}
      </legend>
      <div
        aria-describedby={error ? errorId : help ? helpId : undefined}
        className={cn(
          "flex overflow-hidden rounded-md border",
          error ? "border-accent" : "border-[var(--divider)]",
        )}
      >
        {options.map((o, i) => (
          <label
            key={o.value}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center px-3 py-2.5",
              "text-sm text-text transition-colors duration-150",
              i > 0 && "border-l border-[var(--divider)]",
              "hover:bg-surface-2",
              "has-[input:checked]:bg-[var(--accent-wash)]",
              "has-[input:checked]:font-medium has-[input:checked]:text-accent-ink",
              "has-[input:checked]:shadow-[inset_0_0_0_1px_var(--accent)]",
              "has-[input:focus-visible]:outline has-[input:focus-visible]:-outline-offset-2",
              "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-accent",
              "has-[input:disabled]:cursor-not-allowed",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={o.value === defaultValue}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      {error ? (
        <span id={errorId} role="alert" className="mt-1.5 text-[13px] text-accent-ink">
          {error}
        </span>
      ) : help ? (
        <span id={helpId} className="mt-1.5 text-[13px] text-muted-2">
          {help}
        </span>
      ) : null}
    </fieldset>
  );
}

/* Groupe de choix exclusifs. Rendu en <fieldset> pour que le lecteur
   d'écran annonce l'intitulé du groupe avant les options. */
type RadioGroupProps = {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  help?: string;
};

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  help,
}: RadioGroupProps) {
  return (
    <fieldset className="flex flex-col border-0 p-0">
      <legend className="mb-1.5 block p-0 text-[13px] font-medium text-text">
        {legend}
      </legend>
      <div className="mt-0.5 flex flex-wrap gap-5">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-text"
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "relative inline-block size-4 shrink-0 rounded-full border",
                  checked ? "border-accent" : "border-[var(--divider)]",
                )}
              >
                {checked && (
                  <span className="absolute top-[3px] left-[3px] block size-2 rounded-full bg-accent" />
                )}
              </span>
              {o.label}
            </label>
          );
        })}
      </div>
      {help && <span className="mt-1.5 text-[13px] text-muted-2">{help}</span>}
    </fieldset>
  );
}
