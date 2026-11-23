export function dataDentroDoPeriodo(
    data: Date,
    inicio: Date,
    fim?: Date | null,
): boolean {
    if (data.getTime() < inicio.getTime()) return false;
    if (fim && data.getTime() > fim.getTime()) return false;
    return true;
}