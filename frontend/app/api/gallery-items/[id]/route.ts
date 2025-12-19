import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const item = await prisma.galleryItem.update({ where: { id: params.id }, data: body })
    return NextResponse.json({ ok: true, data: item })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'UPDATE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.galleryItem.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'DELETE_FAILED' }, { status: 500 })
  }
}
