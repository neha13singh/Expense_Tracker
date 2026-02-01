import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify ownership
        const expense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!expense || expense.userId !== session.userId) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
