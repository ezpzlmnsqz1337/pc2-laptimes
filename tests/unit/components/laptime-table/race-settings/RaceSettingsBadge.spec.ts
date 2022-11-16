import RaceSettingsBadge from '@/components/laptime-table/race-settings/RaceSettingsBadge.vue'
import EditableSelect from '@/components/ui/EditableSelect.vue'
import { BadgeType } from '@/constants/BadgeType'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { config, shallowMount } from '@vue/test-utils'
import vSelect from 'vue-select'

describe('RaceSettingsBadge.vue', () => {
  config.global.stubs = {
    EditableSelect: EditableSelect,
    'v-select': vSelect
  }

  it('should emit click event when clicked with the type and value received as props', async () => {
    const allTypes = Object.values(BadgeType)
    for (const type of allTypes) {
      const values = getValues(type)
      for (const value of values) {
        const wrapper = shallowMount(RaceSettingsBadge, {
          props: { type, value }
        })
        await wrapper.trigger('click')

        expect(wrapper.emitted()).toHaveProperty('click')
        expect(wrapper.emitted().click).toHaveLength(1)
        expect(wrapper.emitted().click[0]).toEqual([{ [type]: value }])
        wrapper.unmount()
      }
    }
  })

  it('should emit value:update when child component fires update with the type and value received as props', async () => {
    const allTypes = Object.values(BadgeType)
    for (const type of allTypes) {
      const values = getValues(type)
      for (const value of values) {
        const wrapper = shallowMount(RaceSettingsBadge, {
          props: { type, value }
        })
        wrapper.vm.handleUpdateEvent(type, 'new value')

        expect(wrapper.emitted()).toHaveProperty('value:update')
        expect(wrapper.emitted()['value:update']).toHaveLength(1)
        expect(wrapper.emitted()['value:update'][0]).toEqual([{ key: type, value: 'new value' }])
        wrapper.unmount()
      }
    }
  })

  it('should call getClass method when mounted', () => {
    const type = BadgeType.TRANSMISSION
    const value = TransmissionType.AUTOMATIC

    const getClassSpy = jest.fn()
    // @ts-ignore
    RaceSettingsBadge.methods!.getClass = getClassSpy

    shallowMount(RaceSettingsBadge, { props: { type, value } })

    expect(getClassSpy).toHaveBeenCalledWith(type)
  })
})

function getValues (type: BadgeType): string[] {
  switch (type) {
    case BadgeType.TRANSMISSION:
      return Object.values(TransmissionType)
    case BadgeType.BRAKING_LINE:
      return Object.values(BrakingLine)
    case BadgeType.CONTROLS:
      return Object.values(ControlType)
    case BadgeType.WEATHER:
      return Object.values(WeatherType)
  }
  return []
}
